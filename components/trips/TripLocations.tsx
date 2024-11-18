import GoogleMapsViewer from "@/components/maps/GoogleMapsViewer";
import MapsProvider from "@/components/maps/MapsProvider";

const TripLocations = ({placesIds}: {placesIds: string[]}) => {
  return (
    <div className="py-9 border-t border-separator scroll-mt-[80px]">
      <h3 className="mb-3 text-2xl font-semibold leading-tight">
        Locations
      </h3>
      <MapsProvider>
        <GoogleMapsViewer placesIds={placesIds} />
      </MapsProvider>
    </div>
  );
};

export default TripLocations;
