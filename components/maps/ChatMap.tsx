import { useCallback, useEffect, useState, useMemo } from "react";
import InterestMarkers from "./InterestMarkers";
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import {
  useApiIsLoaded,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useGPTResponseStore } from "@/lib/stores/gpt-response-store";
import toast from "react-hot-toast";
import { DailyItineraryType } from "@/lib/actions/chat/getDailyItinerary";
import { toLatLngLiteral } from "@/lib/utils";
import {
  ActivityType,
  GPTDestinationInput,
  ItineraryDestination,
} from "@/types/trip.types";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
type ChatMapProps = {
  city: LatLngResult;
  searchTypes: {
    includedTypes: string[];
    excludedTypes?: string[];
  };
};

// Add this outside the component to avoid recreation
const SEARCH_RADIUS = 5000;
const MAX_RESULTS = 20;
const REQUIRED_PLACE_FIELDS = [
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
] as const;

const ChatMap = ({ city, searchTypes }: ChatMapProps) => {
  const map = useMap();
  const onLoaded = useApiIsLoaded();
  const placesLib = useMapsLibrary("places");
  const {
    setTitle,
    setLocation,
    setDuration,
    setItinerary,
    updateActivityDuration,
  } = useTripCreatorStore();
  const { setShowEditor } = useTripEditorStore();
  const { dailyItinerary, keywords, setDailyItinerary } = useGPTResponseStore();
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
      const { places } = await placesLib.Place.searchNearby(searchQuery);
      setResults(places);

      const { chatPlaces, inputPlaces, photosCache } = processPlaces(places);

      try {
        const response = await fetch("/api/gpt/itinerary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location: keywords.location,
            duration: keywords.duration,
            inputDestinations: chatPlaces,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        let gptReply = (await response.json()) as DailyItineraryType;
        
        // Map the indices back to real place IDs and add photos
        gptReply = {
          ...gptReply,
          days: gptReply.days.map(day => ({
            ...day,
            activities: day.activities.map(activity => {
              const place = inputPlaces[activity.index];
              if (!place) {
                console.warn(`No place found for index: ${activity.index}`);
                return activity;
              }
              return {
                ...activity,
                id: place.id,
                location: place.location,
                name: activity.name || place.name,
                coverPhoto: place.coverPhoto,
              };
            })
          }))
        };

        setDailyItinerary(gptReply);
        setFinishedGPTInteraction(true);
      } catch (error) {
        toast.error("Failed to generate itinerary");
        console.error(error);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Could not get places: ${error}`);
        setError(error);
      }
    }
  }, [
    placesLib,
    city,
    searchTypes,
    keywords,
    processPlaces,
  ]);

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

      return {
        id:activity.id,
        title: activity.name,
        cover: activity.coverPhoto || "",
        activityType: activity.activityType || "place",
        manualInput: false,
        durationFrom: startTime,
        durationTo: endTime,
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

    setTitle("TEST AI PLANNER");
    setLocation(keywords.location);
    setDuration(parseInt(keywords.duration));
    setItinerary({ days: parsedActivities });

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
