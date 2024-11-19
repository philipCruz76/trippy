import { memo } from 'react';
import GoogleMapsViewer from "@/components/maps/GoogleMapsViewer";
import MapsProvider from "@/components/maps/MapsProvider";

const MemoizedGoogleMapsViewer = memo(GoogleMapsViewer);
const MemoizedMapsProvider = memo(MapsProvider);

const TripLocationsContent = ({placesIds}: {placesIds: string[]}) => {
  return (
    <div className="py-9 border-t border-separator scroll-mt-[112px]">
      <h3 className="mb-3 text-4xl font-semibold text-center leading-tight">
        Locations
      </h3>
      <div className="h-[600px] w-full rounded-xl overflow-hidden">
        <MemoizedMapsProvider>
          <MemoizedGoogleMapsViewer placesIds={placesIds} />
        </MemoizedMapsProvider>
      </div>
    </div>
  );
};

const TripLocations = memo(TripLocationsContent);
export default TripLocations;
