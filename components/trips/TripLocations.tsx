import { memo, useEffect } from 'react';
import { MapboxProvider } from '@/lib/contexts/MapboxContext';
import MapBoxViewer from '@/components/maps/MapBoxViewer';
import { TripDetails } from '@/types/trip.types';

const MemoizedMapsViewer = memo(MapBoxViewer);
const MemoizedMapsProvider = memo(MapboxProvider);

type TripLocationsProps = {
  POIs: TripDetails['itinerary']['dailyTrip'][number]['itinerary'][number]['activities']
}

const TripLocationsContent = ({POIs}: TripLocationsProps) => {

  return (
    <div className="py-9 border-t border-separator scroll-mt-[112px]">
      <h3 className="mb-3 text-4xl font-semibold text-center leading-tight">
        Locations
      </h3>
      <div className="h-[600px] w-full rounded-xl overflow-hidden">
        <MemoizedMapsProvider>
          <MemoizedMapsViewer 
            defaultCenter={[POIs[0].location.lng, POIs[0].location.lat]} 
            defaultZoom={11}
            markers={POIs}
          />
        </MemoizedMapsProvider>
      </div>
    </div>
  );
};

const TripLocations = memo(TripLocationsContent);
export default TripLocations;
