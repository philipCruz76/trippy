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
import { convertCategoriesToIds } from '@/lib/utils/categoryConverter';
import { searchNearbyPlaces } from "@/lib/services/foursquare";
import { usePlaceCache } from "@/lib/stores/place-cache";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from "@/components/ui/dialog";
import MarkerInfoCard from "@/components/ui/MarkerInfoCard";

type MapBoxAIViewProps = {
  city: LatLngResult;
  searchTypes: {
    includedTypes: string[];
    excludedTypes?: string[];
  };
};

type PopupInfo = {
  longitude: number;
  latitude: number;
  name: string;
  description?: string;
  id: string;
  photos: Array<{
    url: string;
    width?: number;
    height?: number;
  }>;
} | null;
type DialogPosition = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

const DIALOG_DIMENSIONS = {
  width: 304,
  height: 436,
  padding: 16,
  markerSize: 48,
} as const;

const MapBoxAIView = ({ city, searchTypes }: MapBoxAIViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const { searchResults, setSearchResults } = useMapbox();
  const [viewState, setViewState] = useState({
    longitude: city.lng,
    latitude: city.lat,
    zoom: 14,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null);

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
  const [dialogPosition, setDialogPosition] = useState<DialogPosition | null>(null);
  const { dailyItinerary, keywords, setDailyItinerary } = useGPTResponseStore();
  const [finishedGPTInteraction, setFinishedGPTInteraction] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const positionRef = useRef<DialogPosition | null>(null);
  const { addPlaces } = usePlaceCache();


  const parseActivities = (
    activities: DailyItineraryType["days"][number]["activities"],
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

      // Find the corresponding place in searchResults to get the cover photo
      const place = searchResults.find(p => p.id === activity.id);
      const coverPhoto = place?.properties?.photos?.[0]?.prefix 
        ? `${place.properties.photos[0].prefix}original${place.properties.photos[0].suffix}`
        : "";

      return {
        id: activity.id,
        title: activity.name,
        cover: coverPhoto,
        activityType:  "place",
        location: {
          lat: activity.location.lat,
          lng: activity.location.lng
        },
        manualInput: false,
        summary: activity.editorialSummary || "",
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
        const places = await searchNearbyPlaces(
          [city.lng, city.lat],
          convertCategoriesToIds(searchTypes.includedTypes),
        );

        console.log(places);
        if (isSubscribed) {
          setSearchResults(places);
          addPlaces(places);

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
                    name: activity.name || place.properties.name,
                    summary: activity.editorialSummary || "",
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
    keywords.location,
    keywords.duration,
  ]);

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

  const calculateDialogPosition = useCallback((rect: DOMRect) => {
    if (typeof window === "undefined") return null;

    const {
      width: dialogWidth,
      height: dialogHeight,
      padding,
    } = DIALOG_DIMENSIONS;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let position: DialogPosition = {};

    // Get the marker element's bounds
    const markerCenterX = rect.left + rect.width / 2;
    const markerCenterY = rect.top + rect.height / 2;

    // Horizontal positioning
    // Try to center the dialog relative to the marker first
    let idealLeft = markerCenterX - dialogWidth / 2;

    // Check if centered position would overflow viewport
    if (idealLeft < padding) {
      // Too close to left edge, align with left edge + padding
      position.left = padding;
    } else if (idealLeft + dialogWidth > viewportWidth - padding) {
      // Too close to right edge, align with right edge - padding
      position.left = viewportWidth - dialogWidth - padding;
    } else {
      // Centered position works fine
      position.left = idealLeft;
    }

    // Vertical positioning
    // First, try to center vertically
    let idealTop = markerCenterY - dialogHeight / 2;

    // Ensure dialog stays within viewport bounds
    if (idealTop < padding) {
      // Too close to top, position below marker
      position.top = Math.min(
        rect.bottom + padding,
        viewportHeight - dialogHeight - padding
      );
    } else if (idealTop + dialogHeight > viewportHeight - padding) {
      // Too close to bottom, position above marker
      position.top = Math.max(
        rect.top - dialogHeight - padding,
        padding
      );
    } else {
      // Centered position works fine
      position.top = idealTop;
    }

    // Final safety check to ensure dialog is always visible
    position.top = Math.max(padding, Math.min(position.top, viewportHeight - dialogHeight - padding));

    return position;
  }, []);


  const onHover = useCallback((event: MapMouseEvent) => {
    if (!event.features || !mapRef.current) return;

    const feature = event.features[0];
    if (!feature || feature.properties?.cluster) return;

    if (feature.geometry && feature.geometry.type === "Point") {
      event.preventDefault();
      
      const [longitude, latitude] = feature.geometry.coordinates;
      const featureId = feature.properties?.id || feature.properties?.fsq_id;
      const place = searchResults.find(p => p.id === featureId);
      
      if (!place) {
        console.warn('Place not found:', featureId);
        return;
      }

      const position = calculateDialogPosition({
        left: event.point.x,
        top: event.point.y,
        width: 0,
        height: 0,
        right: event.point.x,
        bottom: event.point.y
      } as DOMRect);

      setDialogPosition(position);
      setPopupInfo({
        longitude,
        latitude,
        name: place.properties.name,
        description: place.properties.description,
        id: place.id,
        photos: place.properties.photos?.map(photo => ({
          url: `${photo.prefix}original${photo.suffix}`,
        })) || [],
      });
      
      setMarkerId(place.id);
      setHoveredMarkerId(place.id);
    }
  }, [searchResults, setMarkerId, setHoveredMarkerId, calculateDialogPosition]);

  const onMouseLeave = useCallback(() => {
    setPopupInfo(null);
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
        data={{
          type: "FeatureCollection",
          features: searchResults.map(result => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [result.geometry.coordinates[0], result.geometry.coordinates[1]]
            },
            properties: {
              id: result.id,
              ...result.properties
            }
          }))
        }}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...clickablePointLayer} />
      </Source>

      {popupInfo && (
        <Dialog open={!!popupInfo} modal={false}>
          <DialogPortal>
            <DialogOverlay 
              className="fixed inset-0 z-30 bg-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
              onClick={() => setPopupInfo(null)}
            />
            <DialogContent
              id="MapboxMarker"
              style={{
                position: 'fixed',
                ...dialogPosition,
                transform: 'none'
              }}
              onPointerEnter={(e) => {
                e.stopPropagation();
                if (popupInfo) {
                  setMarkerId(popupInfo.id);
                  setHoveredMarkerId(popupInfo.id);
                }
              }}
              onPointerLeave={(e) => {
                e.stopPropagation();
                setPopupInfo(null);
                setMarkerId("");
                setHoveredMarkerId("");
              }}
              className="w-[304px] h-fit p-0 rounded-2xl z-50 shadow-lg bg-white transition-all duration-200 ease-in-out"
            >
              <DialogTitle className="hidden">{popupInfo.name}</DialogTitle>
              <DialogDescription className="hidden">
                {popupInfo.description}
              </DialogDescription>
              <MarkerInfoCard
                placeData={{
                  id: popupInfo.id,
                  type: "Feature",
                  place_type: ["poi"],
                  geometry: {
                    type: "Point",
                    coordinates: [popupInfo.longitude, popupInfo.latitude]
                  },
                  properties: (() => {
                    const place = searchResults.find(p => p.id === popupInfo.id);
                    if (!place) {
                      return {
                        name: popupInfo.name,
                        description: popupInfo.description,
                        coverPhoto: "",
                        rating: 0,
                        userRatingCount: 0,
                        photos: []
                      };
                    }
                    return {
                      name: place?.properties?.name || popupInfo.name,
                      coverPhoto: place?.coverPhoto || "",
                      description: place?.properties?.description,
                      rating: place?.properties?.rating || 0,
                      userRatingCount: place?.properties?.userRatingCount || 0,
                      photos: place?.properties?.photos?.map(photo => ({
                        url: photo.prefix + "original" + photo.suffix,
                        width: 800,  // Default width
                        height: 600  // Default height
                      })) || []
                    };
                  })()
                }}
              />
            </DialogContent>
          </DialogPortal>
        </Dialog>
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
