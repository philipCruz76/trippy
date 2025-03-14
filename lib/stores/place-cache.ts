import { MapboxPlace } from "@/types/mapbox.types";
import { create } from "zustand";

type PlaceCache = {
  places: Map<string, MapboxPlace>;
  addPlaces: (places: MapboxPlace[]) => void;
  getPlace: (id: string) => MapboxPlace | undefined;
  clear: () => void;
};

export const usePlaceCache = create<PlaceCache>((set, get) => ({
  places: new Map(),
  addPlaces: (places) => {
    const newPlaces = new Map(get().places);
    places.forEach((place) => newPlaces.set(place.id, place));
    set({ places: newPlaces });
  },
  getPlace: (id) => get().places.get(id),
  clear: () => set({ places: new Map() }),
}));
