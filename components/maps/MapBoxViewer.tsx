import { useRef, useState, useCallback } from 'react';
import Map, { Source, Layer, MapRef, ViewStateChangeEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { 
  GeoJSONSource, 
  MapLayerMouseEvent,
  CircleLayerSpecification,
  SymbolLayerSpecification
} from 'mapbox-gl';

type MapBoxViewerProps = {
  defaultCenter?: [number, number];
  defaultZoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    name?: string;
    color?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
};

const MapBoxViewer = ({ 
  defaultCenter = [-74.5, 40],
  defaultZoom = 9,
  markers = [],
  onMarkerClick
}: MapBoxViewerProps) => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: defaultCenter[0],
    latitude: defaultCenter[1],
    zoom: defaultZoom
  });

  const points = {
    type: 'FeatureCollection',
    features: markers.map((marker) => ({
      type: 'Feature',
      properties: {
        id: `${marker.lat}-${marker.lng}`,
        cluster: false,
        name: marker.name,
        color: marker.color || '#FF5500'
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.lng, marker.lat]
      }
    }))
  };

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
        20,  // radius for points up to first threshold
        100,
        30,  // radius for points up to second threshold
        750,
        40   // radius for points above second threshold
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

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature || !mapRef.current) return;

    const clusterId = feature.properties?.cluster_id;
    const mapboxSource = mapRef.current.getSource('markers') as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || !feature.geometry) return;

      const coordinates = (feature.geometry as any).coordinates;
      mapRef.current?.easeTo({
        center: coordinates,
        zoom: zoom || defaultZoom,
        duration: 500
      });
    });
  }, [defaultZoom]);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
      style={{ width: '100%', height: '500px' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      interactiveLayerIds={['clusters']}
      onClick={onClick}
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
      </Source>
    </Map>
  );
};

export default MapBoxViewer;