"use client";
import { useCallback, useEffect, useState } from "react";
import InterestMarkers from "./InterestMarkers";
import {
  Map as GoogleMapComponent,
  useApiIsLoaded,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

type GoogleMapsViewerProps = {};

const request: google.maps.places.SearchByTextRequest = {
  textQuery: "Livraria Lello",
  minRating: 3,
  fields: [
    "location",
    "displayName",
    "formattedAddress",
    "photos",
    "rating",
    "svgIconMaskURI",
    "types",
    "userRatingCount",
    "editorialSummary",
  ],
  isOpenNow: true,
  maxResultCount: 5,
  useStrictTypeFiltering: false,
  region: "pt",
};
const GoogleMapsViewer = ({}: GoogleMapsViewerProps) => {
  const [results, setResults] = useState<google.maps.places.Place[]>([]);

  const map = useMap();
  const onLoaded = useApiIsLoaded();
  const placesLib = useMapsLibrary("places");
  const [error, setError] = useState<Error | null>(null);

  const getResults = useCallback(async () => {
    if (!placesLib) return;
    try {
      const { places } = await placesLib.Place.searchByText(request);
      setResults(places);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Could not get places: ${error}`);
        setError(error);
      }
    }
  }, [placesLib, onLoaded]);

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
    getResults();
  }, [getResults, onLoaded]);

  if (error) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <GoogleMapComponent
        id="main-map"
        style={{ width: "80dvw", height: "90dvh" }}
        mapId={"768edab3237ff37e"}
        defaultCenter={{ lat: 41.14961, lng: -8.61099 }}
        defaultZoom={15}
        onClick={(e) => {
          e.domEvent?.preventDefault();
        }}
        gestureHandling={"cooperative"}
      >
        <InterestMarkers pois={results} />
      </GoogleMapComponent>
    </div>
  );
};

export default GoogleMapsViewer;
