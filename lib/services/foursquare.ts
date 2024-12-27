import { MapboxPlace } from "@/types/mapbox.types";

const FOURSQUARE_API_KEY = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY;

export async function searchNearbyPlaces(
  center: [number, number],
  types: string[] = [],
): Promise<MapboxPlace[]> {
  try {
    if (types.length === 0) {
      throw new Error("No types provided for search");
    }

    const radius = 10000; // 10km in meters
    const results: any[] = [];

    // Search each category separately
    for (const type of types) {
      try {
        const response = await fetch(
          `https://api.foursquare.com/v3/places/search?` +
            new URLSearchParams({
              ll: `${center[1]},${center[0]}`,
              radius: radius.toString(),
              categories: type,
              limit: "5",
              sort: "relevance",
              fields:
                "fsq_id,name,geocodes,location,description,hours,rating,photos,categories,website,tel,social_media,features,price",
            }),
          {
            headers: {
              Authorization: FOURSQUARE_API_KEY!,
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Foursquare API error: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        results.push(...data.results);
      } catch (error) {
        console.error(`Error fetching category ${type}:`, error);
        // Continue with other categories even if one fails
        continue;
      }
    }

    if (results.length === 0) {
      throw new Error("No results found for any category");
    }

    // Convert Foursquare results to MapboxPlace format
    const formattedResults: MapboxPlace[] = results.map((place) => ({
      id: place.fsq_id,
      type: "Feature" as const,
      place_type: ["poi"],
      properties: {
        name: place.name,
        description: place.description || "",
        address: place.location.formatted_address,
        category: place.categories[0]?.name,
        rating: place.rating,
        mapbox_id: place.fsq_id,
        photos: place.photos || [],
      },
      geometry: {
        type: "Point" as const,
        coordinates: [
          place.geocodes.main.longitude,
          place.geocodes.main.latitude,
        ],
      },
      placeId: place.fsq_id,
      formattedAddress: place.location.formatted_address,
      editorialSummary: place.description || "",
      coverPhoto: place.photos?.[0]
        ? `${place.photos[0].prefix}original${place.photos[0].suffix}`
        : "",
      socialMedia: place.social_media || {},
      website: place.website || "",
      phone: place.tel || "",
      features: place.features || {},
      regularOpeningHours: {
        weekdayDescriptions: place.hours?.display ? [place.hours.display] : [],
        periods:
          place.hours?.regular?.map((period: any) => ({
            open: { day: period.day, time: period.open },
            close: { day: period.day, time: period.close },
          })) || [],
      },
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error in searchNearbyPlaces:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}
