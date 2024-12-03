import { memo } from 'react';
import { MapboxProvider } from '@/lib/contexts/MapboxContext';
import MapBoxViewer from '@/components/maps/MapBoxViewer';

const MemoizedMapsViewer = memo(MapBoxViewer);
const MemoizedMapsProvider = memo(MapboxProvider);

const markers = [
  { id: '1', latitude: 40.7128, longitude: -74.0060 }, // New York
  { id: '2', latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
];

const TripLocationsContent = ({POILocations}: {POILocations: {lat: number, lng: number}[]}) => {
  return (
    <div className="py-9 border-t border-separator scroll-mt-[112px]">
      <h3 className="mb-3 text-4xl font-semibold text-center leading-tight">
        Locations
      </h3>
      <div className="h-[600px] w-full rounded-xl overflow-hidden">
        <MemoizedMapsProvider>
          <MemoizedMapsViewer 
           defaultCenter={[4.9041, 52.3676]} // Center of Amsterdam
           defaultZoom={10}
           markers={POILocations}
           onMarkerClick={(id) => console.log(`Clicked marker ${id}`)}
          />
        </MemoizedMapsProvider>
      </div>
    </div>
  );
};

const TripLocations = memo(TripLocationsContent);
export default TripLocations;
