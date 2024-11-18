import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";

export const usePlaceDetails = (placeIds: string[]) => {
  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);
  const [loading, setLoading] = useState(true);
  const onLoaded = useApiIsLoaded()
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!placeIds.length ) return;
      setLoading(true);
      const { Place } = (await google.maps.importLibrary(
        "places",
      )) as google.maps.PlacesLibrary;

      try {
        
        const placePromises = placeIds.map((placeId) => {
          const place = new Place({
            id: placeId,
            requestedLanguage: "en",
          });

          return place.fetchFields({
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
          });
        });

        const results = await Promise.allSettled(placePromises);
        const successfulPlaces = results
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<{ place: google.maps.places.Place }> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value.place);

        
        setPlaces(successfulPlaces);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch place details",
        );
        setLoading(false);
      }
    };


    if(!onLoaded) {
      return;
    }
    fetchPlaceDetails();
  }, [placeIds, onLoaded]);

  return { places, loading, error };
};
