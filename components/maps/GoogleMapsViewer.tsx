"use client";
import { useEffect, useState } from "react";
import InterestMarkers from "./InterestMarkers";
import {
  Map as GoogleMapComponent,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { usePlaceDetails } from "@/lib/hooks/usePlaceDetails";

type GoogleMapsViewerProps = {
  placesIds: string[];
};

const GoogleMapsViewer = ({ placesIds }: GoogleMapsViewerProps) => {
  const { places, loading } = usePlaceDetails(placesIds);
  const map = useMap();
 
  const placesLib = useMapsLibrary("places");
  const [error, setError] = useState<Error | null>(null);
  const [showMap, setShowMap] = useState(false);

  // initialize places service
  useEffect(() => {
    if (!map || !placesLib) return;
    try {
    } catch (error) {
      if (error instanceof Error) {
        console.warn(
          `Could not initialize google places service: ${error.message}`,
        );
        setError(error);
      }
    }
  }, [map, placesLib]);

  useEffect(() => {
    if (places.length > 0) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  }, [places]);

  if (error) return null;
  if (!showMap) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {!loading && (
        <GoogleMapComponent
          id="main-map"
          style={{ width: "80dvw", height: "90dvh" }}
          mapId={"768edab3237ff37e"}
          defaultCenter={{
            lat: places[0].location?.lat() ?? 0,
            lng: places[0].location?.lng() ?? 0,
          }}
          defaultZoom={15}
          onClick={(e) => {
            e.domEvent?.preventDefault();
          }}
          gestureHandling={"cooperative"}
        >
          <InterestMarkers pois={places} />
        </GoogleMapComponent>
      )}
    </div>
  );
};

export default GoogleMapsViewer;
