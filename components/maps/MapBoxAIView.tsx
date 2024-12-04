import { useRef, useState, useCallback, useMemo } from "react";
import Map, {
  Source,
  Layer,
  MapRef,
  ViewStateChangeEvent,
  Popup,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import { MapboxProvider, useMapbox } from "@/lib/contexts/MapboxContext";
import type {
  GeoJSONSource,
  CircleLayerSpecification,
  SymbolLayerSpecification,
  MapMouseEvent,
} from "mapbox-gl";
import { searchNearbyPlaces } from "@/lib/services/mapbox";
import { useEffect } from "react";
import { useGPTResponseStore } from "@/lib/stores/gpt-response-store";
import { usePOIStore } from "@/lib/stores/poi-store";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import {
  ActivityType,
  GPTDestinationInput,
  ItineraryDestination,
} from "@/types/trip.types";
import { MapboxPlace } from "@/types/mapbox.types";
import { DailyItineraryType } from "@/lib/actions/chat/getDailyItinerary";
import toast from "react-hot-toast";

type MapBoxAIViewProps = {
  city: LatLngResult;
  searchTypes: {
    includedTypes: string[];
    excludedTypes?: string[];
  };
};

const MapBoxAIView = ({ city, searchTypes }: MapBoxAIViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const { searchResults, setSearchResults } = useMapbox();
  const [viewState, setViewState] = useState({
    longitude: city.lng,
    latitude: city.lat,
    zoom: 14,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    name: string;
    description?: string;
    id: string;
  } | null>(null);

  const { setMarkerId, setHoveredMarkerId } = usePOIStore();
  const {
    setTitle,
    setLocation,
    setComment,
    setDuration,
    setItinerary,
    updateActivityDuration,
  } = useTripCreatorStore();
  const { setShowEditor } = useTripEditorStore();
  const { dailyItinerary, keywords, setDailyItinerary } = useGPTResponseStore();
  const [finishedGPTInteraction, setFinishedGPTInteraction] = useState(false);

  const processPlaces = useCallback((places: MapboxPlace[]) => {
    const chatPlaces: GPTDestinationInput[] = [];
    const inputPlaces: ItineraryDestination[] = [];
    const coverPhoto = "";
    places.forEach((place, index) => {
      if (!place.placeId) {
        console.warn("Place missing ID:", place);
        return;
      }

      // Only send name and description to GPT
      chatPlaces.push({
        index: index,
        name: place.properties.name,
        description: place.properties.description || "",
      });

      // Keep full place data in inputPlaces
      inputPlaces.push({
        id: place.id,
        name: place.properties.name,
        coverPhoto,
        location: {
          latitude: place.geometry.coordinates[1],
          longitude: place.geometry.coordinates[0],
        },
        openingHours: place.regularOpeningHours?.weekdayDescriptions,
        description: place.properties.description || "",
      });
    });

    return { chatPlaces, inputPlaces, coverPhoto };
  }, []);
  const parseActivities = (
    activities: any[],
    startTime: string = "09:00",
  ): ActivityType[] => {
    let currentTime = startTime;
    return activities.map((activity) => {
      const startTime = currentTime;
      const [hours, minutes] = currentTime.split(":").map(Number);
      let newHours = hours;
      let newMinutes = minutes + 90;

      if (newMinutes >= 60) {
        newHours += Math.floor(newMinutes / 60);
        newMinutes = newMinutes % 60;
      }

      const endTime = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
      currentTime = endTime;

      return {
        id: activity.id,
        title: activity.name,
        cover: activity.coverPhoto || "",
        activityType: activity.activityType || "place",
        location: {
          lat: activity.location.latitude,
          lng: activity.location.longitude,
        },
        manualInput: false,
        durationFrom: startTime,
        durationTo: endTime,
      };
    });
  };

  const parsedActivities = useMemo(() => {
    if (!finishedGPTInteraction || dailyItinerary.days.length < 1) return [];
    return dailyItinerary.days.map((day) => ({
      dailyActivities: parseActivities(day.activities),
    }));
  }, [finishedGPTInteraction, dailyItinerary.days]);

  // Search for places when the map loads
  useEffect(() => {
    let isSubscribed = true;

    const fetchPlaces = async () => {
      if (!isSubscribed) return;
      setIsLoading(true);

      try {
        const searchTypesString = searchTypes.includedTypes.join(" ");
        const places = await searchNearbyPlaces(
          searchTypesString,
          [city.lng, city.lat],
          searchTypes.includedTypes,
        );

        if (isSubscribed) {
          setSearchResults(places);

          try {
            const response = await fetch("/api/gpt/itinerary", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                location: keywords.location,
                duration: keywords.duration,
                inputDestinations: places,
              }),
            });

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            let gptReply = (await response.json()) as DailyItineraryType;

            // Map the indices back to real place IDs and add photos
            gptReply = {
              ...gptReply,
              days: gptReply.days.map((day) => ({
                ...day,
                activities: day.activities.map((activity) => {
                  const place = places[activity.index];
                  if (!place) {
                    console.warn(`No place found for index: ${activity.index}`);
                    return activity;
                  }
                  return {
                    ...activity,
                    id: place.id,
                    location: keywords.location,
                    name: activity.name || place.properties.name,
                    coverPhoto: "",
                  };
                }),
              })),
            };

            setDailyItinerary(gptReply);
            setFinishedGPTInteraction(true);
          } catch (error) {
            toast.error("Failed to generate itinerary");
            console.error(error);
          }

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch nearby places:", error);
        setIsLoading(false);
      }
    };

    fetchPlaces();

    return () => {
      isSubscribed = false;
    };
  }, [
    city.lat,
    city.lng,
    searchTypes.includedTypes,
    setSearchResults,
    processPlaces,
    keywords.location,
    keywords.duration,
  ]);

  // Convert search results to GeoJSON
  const points = {
    type: "FeatureCollection",
    features: searchResults.map((place) => ({
      type: "Feature",
      properties: {
        id: place.id,
        name: place.properties.name,
        description: place.properties.description,
      },
      geometry: {
        type: "Point",
        coordinates: place.geometry.coordinates,
      },
    })),
  };

  // Layer styles remain the same as your original code
  const clusterLayer: CircleLayerSpecification = {
    id: "clusters",
    type: "circle",
    source: "markers",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#ffffff",
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#000000",
    },
  };

  const clusterCountLayer: SymbolLayerSpecification = {
    id: "cluster-count",
    type: "symbol",
    source: "markers",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 14,
    },
    paint: {
      "text-color": "#000000",
    },
  };

  const unclusteredPointLayer: CircleLayerSpecification = {
    id: "unclustered-point",
    type: "circle",
    source: "markers",
    filter: ["!", ["has", "point_count"]],
    paint: {
      'circle-color': "#ffffff",
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': "#000000",
    },
  };

  const onHover = useCallback((event: MapMouseEvent) => {
    if (!event.features || !mapRef.current) return;

    const feature = event.features[0];
    if (!feature || feature.properties?.cluster) return;

    if (feature.geometry && feature.geometry.type === "Point") {
      const [longitude, latitude] = feature.geometry.coordinates;
      const id = feature.properties?.id;

      // Update both popup and POI store state
      setPopupInfo({
        longitude,
        latitude,
        name: feature.properties?.name || "Unknown location",
        description: feature.properties?.description,
        id: id || `${longitude}-${latitude}`,
      });
      
      // Update POI store state
      setMarkerId(id);
      setHoveredMarkerId(id);
    }
  }, [setMarkerId, setHoveredMarkerId]);

  const onMouseLeave = useCallback(() => {
    setPopupInfo(null);
    // Clear POI store state
    setMarkerId("");
    setHoveredMarkerId("");
  }, [setMarkerId, setHoveredMarkerId]);

  // Modify the click handler to only handle clusters
  const onClick = useCallback((event: MapMouseEvent) => {
    if (!event.features || !mapRef.current) return;

    const feature = event.features[0];
    if (!feature || !feature.properties?.cluster) return;

    const clusterId = feature.properties.cluster_id;
    const mapboxSource = mapRef.current.getSource("markers") as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || !feature.geometry || feature.geometry.type !== "Point") return;

      const [longitude, latitude] = feature.geometry.coordinates;
      mapRef.current?.easeTo({
        center: [longitude, latitude],
        zoom: zoom || 14,
        duration: 500,
      });
    });
  }, []);

  // Add layer for clickable points
  const clickablePointLayer: CircleLayerSpecification = {
    id: "clickable-points",
    type: "circle",
    source: "markers",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#007cbf",
      "circle-radius": 10,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  };

  // Add the parseActivities function and parsedActivities memo
  // ... (copy from ChatMap lines 203-252)

  // Add the effect to handle finished GPT interaction
  useEffect(() => {
    if (!finishedGPTInteraction || parsedActivities.length < 1) return;

    setTitle(dailyItinerary.title);
    setLocation(keywords.location);
    setDuration(parseInt(keywords.duration));
    setItinerary({ days: parsedActivities });
    setComment(dailyItinerary.summary);

    parsedActivities.forEach((day, dayIndex) => {
      day.dailyActivities.forEach((activity, activityIndex) => {
        updateActivityDuration(
          dayIndex,
          activityIndex,
          activity.durationFrom!,
          activity.durationTo!,
        );
      });
    });

    setShowEditor(true);
  }, [
    finishedGPTInteraction,
    parsedActivities,
    keywords.location,
    keywords.duration,
  ]);

  if (isLoading || searchResults.length === 0) {
    return <div>Loading places...</div>;
  }

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
      onClick={onClick}
      onMouseMove={onHover}
      onMouseLeave={onMouseLeave}
      style={{ width: "49dvw", height: "88dvh" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      interactiveLayerIds={["clusters", "unclustered-point", "clickable-points"]}
      renderWorldCopies={false}
      reuseMaps
      antialias
    >
      <Source
        id="markers"
        type="geojson"
        data={points}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...clickablePointLayer} />
      </Source>

      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          anchor="bottom"
          closeButton={false}
          closeOnClick={false}
          className="rounded-lg shadow-lg"
        >
          <div className="p-4 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">{popupInfo.name}</h3>
            {popupInfo.description && (
              <p className="text-sm text-gray-600 mb-3">
                {popupInfo.description}
              </p>
            )}
            <button
              onClick={() => {
                setMarkerId(popupInfo.id);
                setPopupInfo(null);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
            >
              View Details
            </button>
          </div>
        </Popup>
      )}
    </Map>
  );
};

// Keep the wrapper component
const MapBoxAIViewWrapper = (props: MapBoxAIViewProps) => (
  <MapboxProvider>
    <MapBoxAIView {...props} />
  </MapboxProvider>
);

export default MapBoxAIViewWrapper;
