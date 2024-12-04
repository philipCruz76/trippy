import { useCallback, useEffect, useState, useMemo } from "react";
import InterestMarkers from "./InterestMarkers";
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import {
  useApiIsLoaded,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useGPTResponseStore } from "@/lib/stores/gpt-response-store";
import toast from "react-hot-toast";
import { toLatLngLiteral } from "@/lib/utils";
import {
  ActivityType,
  GPTDestinationInput,
  ItineraryDestination,
} from "@/types/trip.types";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import { Activity } from "@prisma/client";

type SearchQueryResponse = {
  id: string;
} | Activity;

type ChatMapProps = {
  city: LatLngResult;
  searchTypes: {
    includedTypes: string[];
    excludedTypes?: string[];
  };
};

const ChatMap = ({ city, searchTypes }: ChatMapProps) => {
  const onLoaded = useApiIsLoaded();
  const placesLib = useMapsLibrary("places");
  const {
    setTitle,
    setLocation,
    setComment,
    setDuration,
    setItinerary,
    updateActivityDuration,
  } = useTripCreatorStore();
  const { setShowEditor } = useTripEditorStore();
  const { dailyItinerary, keywords, setDailyItinerary, setSearchQueryId } = useGPTResponseStore();
  const [finishedGPTInteraction, setFinishedGPTInteraction] =
    useState<boolean>(false);
  const [results, setResults] = useState<google.maps.places.Place[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Optimize place mapping by reducing iterations
  const processPlaces = useCallback((places: google.maps.places.Place[]) => {
    const chatPlaces: GPTDestinationInput[] = [];
    const inputPlaces: ItineraryDestination[] = [];
    const photosCache = new Map<string, string>();

    places.forEach((place, index) => {
      if (!place.id) {
        console.warn('Place missing ID:', place);
        return;
      }

      const location = toLatLngLiteral(place.location!);
      const coverPhoto = place.photos?.[0].getURI() || "";
      
      // Cache the photo URL
      photosCache.set(place.id, coverPhoto);

      // Only send name and description to GPT
      chatPlaces.push({
        index: index,
        name: place.displayName!,
        description: place.editorialSummary || "",
      });

      // Keep full place data in inputPlaces
      inputPlaces.push({
        id: place.id,
        name: place.displayName!,
        coverPhoto,
        location: {
          latitude: location.lat,
          longitude: location.lng,
        },
        openingHours: place.regularOpeningHours?.weekdayDescriptions,
        description: place.editorialSummary || "",
      });
    });

    return { chatPlaces, inputPlaces, photosCache };
  }, []);
  // Memoize the search query
  const searchQuery = useMemo<google.maps.places.SearchNearbyRequest>(
    () => ({
      locationRestriction: {
        center: { lat: city.lat, lng: city.lng },
        radius: 5000,
      },
      includedTypes: searchTypes.includedTypes,
      excludedTypes: searchTypes.excludedTypes,
      maxResultCount: 20,
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
        "regularOpeningHours",
      ],
    }),
    [searchTypes.includedTypes, searchTypes.excludedTypes],
  );

  const getResults = useCallback(async () => {
    if (!placesLib) return;

    try {
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          latitude: city.lat,
          longitude: city.lng,
          includedTypes: searchTypes.includedTypes,
        }),
      });

      if (!searchResponse.ok) {
        throw new Error(`HTTP error! status: ${searchResponse.status}`);
      }

      const searchQueryResult = (await searchResponse.json()) as SearchQueryResponse;

      // Handle the case when we get cached activities
      if (searchQueryResult && Array.isArray(searchQueryResult) && 
          searchQueryResult.length > 0 && 'placeId' in searchQueryResult[0]) {
        console.log("Using cached activities");
        const places = await Promise.all(
          searchQueryResult.map(activity => 
            new placesLib.Place({ id: activity.placeId })
          )
        );
        setResults(places);
        setSearchQueryId(searchQueryResult[0].searchQueryId);
      } 
      // Handle the case when we need to perform a new search
      else {
        toast.success("Performing new places search");
        const { places } = await placesLib.Place.searchNearby(searchQuery);
        setResults(places);
        
        if ('id' in searchQueryResult) {
          setSearchQueryId(searchQueryResult.id);
        }
      }

    } catch (error) {
      setError(error as Error);
      console.error("Failed to fetch places:", error);
    }
  }, [placesLib, city, searchTypes, keywords, processPlaces]);

  useEffect(() => {
    getResults();
  }, [onLoaded]);

  // Add this before the component or outside
  const parseActivities = (
    activities: any[],
    startTime: string = "09:00",
  ): ActivityType[] => {
    let currentTime = startTime;

    return activities.map((activity) => {
      const startTime = currentTime;
      const [hours, minutes] = currentTime.split(":").map(Number);
      let newHours = hours;
      let newMinutes = minutes + 90;

      if (newMinutes >= 60) {
        newHours += Math.floor(newMinutes / 60);
        newMinutes = newMinutes % 60;
      }

      const endTime = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
      currentTime = endTime;

      // Convert the location format to match ActivityType
      const location = activity.location ? {
        lat: activity.location.latitude,
        lng: activity.location.longitude
      } : {
        lat: 0,
        lng: 0
      };

      return {
        id: activity.id,
        title: activity.name,
        cover: activity.coverPhoto || "",
        activityType: activity.activityType || "place",
        location: location,
        manualInput: false,
        durationFrom: startTime,
        durationTo: endTime,
        searchQueryId: searchQuery,
      };
    });
  };

  // In your component, memoize the parsed activities calculation
  const parsedActivities = useMemo(() => {
    if (!finishedGPTInteraction || dailyItinerary.days.length < 1) return [];

    return dailyItinerary.days.map((day) => ({
      dailyActivities: parseActivities(day.activities),
    }));
  }, [finishedGPTInteraction, dailyItinerary.days]);

  useEffect(() => {
    if (!finishedGPTInteraction || parsedActivities.length < 1) return;

    setTitle(dailyItinerary.title);
    setLocation(keywords.location);
    setDuration(parseInt(keywords.duration));
    setItinerary({ days: parsedActivities });
    setComment(dailyItinerary.summary);

    // Batch the duration updates
    parsedActivities.forEach((day, dayIndex) => {
      day.dailyActivities.forEach((activity, activityIndex) => {
        updateActivityDuration(
          dayIndex,
          activityIndex,
          activity.durationFrom!,
          activity.durationTo!,
        );
      });
    });

    setShowEditor(true);
  }, [
    finishedGPTInteraction,
    parsedActivities,
    keywords.location,
    keywords.duration,
  ]);

  if (error) return null;
  return <InterestMarkers pois={results} />;
};

export default ChatMap;
