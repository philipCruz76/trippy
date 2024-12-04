import { MapboxPlace, MapboxSearchResponse } from "@/types/mapbox.types";

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export async function searchNearbyPlaces(
  query: string,
  center: [number, number],
  types: string[] = []
): Promise<MapboxPlace[]> {
  if (types.length === 0) {
    throw new Error('No types provided for search');
  }

  // Calculate bounding box (using approximately 10km radius)
  const radius = 10; // kilometers
  const lat = center[1];
  const lon = center[0];
  
  // Calculate bounding box (approximately)
  const latRadius = radius / 111.32; // roughly 1 degree = 111.32 km
  const lonRadius = radius / (111.32 * Math.cos(lat * (Math.PI / 180)));
  
  const bbox = [
    Math.max(-180, lon - lonRadius),  // min longitude
    Math.max(-90, lat - latRadius),   // min latitude
    Math.min(180, lon + lonRadius),   // max longitude
    Math.min(90, lat + latRadius)     // max latitude
  ].join(',');

  const results: MapboxSearchResponse[] = [];

  // Search each category separately
  for (const type of types) {
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/category/${type}?` +
      new URLSearchParams({
        access_token: MAPBOX_API_KEY!,
        limit: '5',
        origin: `${center[0]},${center[1]}`,
        bbox: bbox,
        language: 'en'
      })
    );

    if (!response.ok) {
      throw new Error('Mapbox category search failed');
    }

    const data = await response.json();
    results.push(data);
  }

  // Combine and format all results
  const formattedResults = results.flatMap(response => 
    response.features.map((feature, index) => ({
      ...feature,
      placeId: feature.properties.mapbox_id,
      formattedAddress: feature.properties.address,
      editorialSummary: feature.properties.description || "",
      regularOpeningHours: {
        weekdayDescriptions: [],
        periods: []
      }
    }))
  );

  return formattedResults;
}

export function mapboxToGPTDestination(place: MapboxPlace) {
  return {
    id: place.id,
    name: place.properties.name,
    description: place.properties.description || "",
    location: {
      lat: place.geometry.coordinates[1],
      lng: place.geometry.coordinates[0],
    },
    formatted_address: place.properties.address || "",
  };
} 