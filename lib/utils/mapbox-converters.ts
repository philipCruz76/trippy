import { GPTDestinationInput } from "@/types/trip.types";
import { MapboxPlace } from "@/types/mapbox.types";

export function mapboxToGPTInput(places: MapboxPlace[]): GPTDestinationInput[] {
  return places.map((place, index) => ({
    id: place.id,
    index,
    name: place.properties.name,
    description: place.properties.description || "",
  }));
}

export function mapboxToActivityType(place: MapboxPlace) {
  return {
    id: place.id,
    title: place.properties.name,
    cover: "", // Placeholder for photo implementation
    activityType: place.properties.category || "place",
    location: {
      lat: place.geometry.coordinates[1],
      lng: place.geometry.coordinates[0]
    },
    manualInput: false,
    durationFrom: "09:00", // Default values
    durationTo: "10:30"
  };
} 