import { useRef, useState, useCallback, useEffect } from "react";
import Map, { Source, Layer, MapRef, ViewStateChangeEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type {
  GeoJSONSource,
  CircleLayerSpecification,
  SymbolLayerSpecification,
  MapMouseEvent,
} from "mapbox-gl";
import { TripDetails } from "@/types/trip.types";
import { usePOIDrawerStore } from "@/lib/stores/poi-drawer-store";
import { usePOIStore } from "@/lib/stores/poi-store";
import POIDrawer from "./POIDrawer";

type MapBoxViewerProps = {
  defaultCenter: [number, number];
  defaultZoom: number;
  markers: TripDetails["itinerary"]["dailyTrip"][number]["itinerary"][number]["activities"];
};

const MapBoxViewer = ({
  defaultCenter,
  defaultZoom,
  markers,
}: MapBoxViewerProps) => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: defaultCenter[0],
    latitude: defaultCenter[1],
    zoom: defaultZoom,
  });
  const [selectedPOI, setSelectedPOI] = useState<
    | TripDetails["itinerary"]["dailyTrip"][number]["itinerary"][number]["activities"][0]
    | null
  >(null);

  const { setMarkerId, setHoveredMarkerId } = usePOIStore();
  const { setShowDrawer } = usePOIDrawerStore();

  const points = {
    type: "FeatureCollection",
    features: markers.map((marker) => ({
      type: "Feature",
      properties: {
        id: `${marker.location.lat}-${marker.location.lng}`,
        cluster: false,
        name: marker.activityName,
        color: "#FF5500",
        description: marker.summary,
        photos: marker.photos,
      },
      geometry: {
        type: "Point",
        coordinates: [marker.location.lng, marker.location.lat],
      },
    })),
  };

  const clusterLayer: CircleLayerSpecification = {
    id: "clusters",
    type: "circle",
    source: "markers",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#ffffff",
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20, // radius for points up to first threshold
        100,
        30, // radius for points up to second threshold
        750,
        40, // radius for points above second threshold
      ],
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
      "circle-color": "#ffffff",
      "circle-radius": 6,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#000000",
    },
  };

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      if (feature.properties?.cluster) {
        const clusterId = feature.properties.cluster_id;
        const mapboxSource = mapRef.current?.getSource(
          "markers",
        ) as GeoJSONSource;

        mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !feature.geometry) return;

          const coordinates = (feature.geometry as any).coordinates;
          mapRef.current?.easeTo({
            center: coordinates,
            zoom: zoom || defaultZoom,
            duration: 500,
          });
        });
      } else if (feature.properties) {
        const clickedMarker = markers.find(
          (marker) => marker.activityName === feature.properties?.name,
        );
        setSelectedPOI(clickedMarker || null);
        setHoveredMarkerId(clickedMarker?.place_id || "");
        setMarkerId(clickedMarker?.place_id || "");
        setShowDrawer(true);
      }
    },
    [defaultZoom, setHoveredMarkerId, setMarkerId, setShowDrawer, markers],
  );

  useEffect(() => {
    if (selectedPOI) {
      mapRef.current?.easeTo({
        center: [selectedPOI.location.lng, selectedPOI.location.lat],
        zoom: 13,
        duration: 500,
      });
    }
  }, [selectedPOI]);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "500px" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      interactiveLayerIds={["clusters", "unclustered-point"]}
      onClick={handleClick}
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
        <Layer {...unclusteredPointLayer} />
        {selectedPOI && <POIDrawer placeData={selectedPOI} />}
      </Source>
    </Map>
  );
};

export default MapBoxViewer;
