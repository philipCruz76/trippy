import { useRef, useState, useCallback } from 'react';
import Map, { Source, Layer, MapRef, ViewStateChangeEvent, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import { MapboxProvider, useMapbox } from '@/lib/contexts/MapboxContext';
import type { 
  GeoJSONSource, 
  CircleLayerSpecification,
  SymbolLayerSpecification,
  MapMouseEvent
} from 'mapbox-gl';
import { searchNearbyPlaces } from '@/lib/services/mapbox';
import { useEffect } from 'react';
import { useGPTResponseStore } from "@/lib/stores/gpt-response-store";
import { usePOIStore } from '@/lib/stores/poi-store';

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
  const { keywords } = useGPTResponseStore();
  const [viewState, setViewState] = useState({
    longitude: city.lng,
    latitude: city.lat,
    zoom: 14
  });
  const [isLoading, setIsLoading] = useState(true);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    name: string;
    description?: string;
    id: string;
  } | null>(null);
  
  const {  setMarkerId } = usePOIStore();

  // Search for places when the map loads
  useEffect(() => {
    let isSubscribed = true;

    const fetchPlaces = async () => {
      if (!isSubscribed) return;
      setIsLoading(true);

      try {
        const searchTypesString = searchTypes.includedTypes.join(' ');
        const places = await searchNearbyPlaces(
          searchTypesString,
          [city.lng, city.lat],
          searchTypes.includedTypes
        );

        if (isSubscribed) {
          setSearchResults(places);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch nearby places:', error);
        setIsLoading(false);
      }
    };

    fetchPlaces();

    return () => {
      isSubscribed = false;
    };
  }, [city.lat, city.lng, searchTypes.includedTypes, setSearchResults]);

  // Convert search results to GeoJSON
  const points = {
    type: 'FeatureCollection',
    features: searchResults.map(place => ({
      type: 'Feature',
      properties: {
        id: place.id,
        name: place.properties.name,
        description: place.properties.description
      },
      geometry: {
        type: 'Point',
        coordinates: place.geometry.coordinates
      }
    }))
  };

  // Layer styles remain the same as your original code
  const clusterLayer: CircleLayerSpecification = {
    id: 'clusters',
    type: 'circle',
    source: 'markers',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#ffffff',
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        100,
        30,
        750,
        40
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#000000'
    }
  };

  const clusterCountLayer: SymbolLayerSpecification = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'markers',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 14
    },
    paint: {
      'text-color': '#000000'
    }
  };

  const unclusteredPointLayer: CircleLayerSpecification = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'markers',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#ffffff',
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#000000'
    }
  };

  const onHover = useCallback((event: MapMouseEvent) => {
    if (!event.features || !mapRef.current) return;

    const feature = event.features[0];
    if (!feature || feature.properties?.cluster) return;

    if (feature.geometry && feature.geometry.type === 'Point') {
      const [longitude, latitude] = feature.geometry.coordinates;
      
      setPopupInfo({
        longitude,
        latitude,
        name: feature.properties?.name || 'Unknown location',
        description: feature.properties?.description,
        id: feature.properties?.id || `${longitude}-${latitude}`
      });
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setPopupInfo(null);
  }, []);

  // Modify the click handler to only handle clusters
  const onClick = useCallback((event: MapMouseEvent) => {
    if (!event.features || !mapRef.current) return;

    const feature = event.features[0];
    if (!feature || !feature.properties?.cluster) return;

    const clusterId = feature.properties.cluster_id;
    const mapboxSource = mapRef.current.getSource('markers') as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || !feature.geometry || feature.geometry.type !== 'Point') return;

      const [longitude, latitude] = feature.geometry.coordinates;
      mapRef.current?.easeTo({
        center: [longitude, latitude],
        zoom: zoom || 14,
        duration: 500
      });
    });
  }, []);

  // Add layer for clickable points
  const clickablePointLayer: CircleLayerSpecification = {
    id: 'clickable-points',
    type: 'circle',
    source: 'markers',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#007cbf',
      'circle-radius': 10,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  };

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
      style={{ width: '49dvw', height: '88dvh' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      interactiveLayerIds={['clusters', 'clickable-points']}
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
              <p className="text-sm text-gray-600 mb-3">{popupInfo.description}</p>
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