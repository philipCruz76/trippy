import { create } from "zustand";

type POIStore = {
  markerId: string;
  hoveredMarkerId: string;
  setMarkerId: (id: string) => void;
  setHoveredMarkerId: (id: string) => void;
};

export const usePOIStore = create<POIStore>((set) => ({
  markerId: "",
  hoveredMarkerId: "",
  setMarkerId: (id) => set({ markerId: id }),
  setHoveredMarkerId: (id) => set({ hoveredMarkerId: id }),
}));
