import { create } from "zustand";

type POIDrawerState = {
  showDrawer: boolean;
  setShowDrawer: (showDrawer: boolean) => void;
};

export const usePOIDrawerStore = create<POIDrawerState>()((set) => ({
  showDrawer: false,
  setShowDrawer: (showDrawer: boolean) => set({ showDrawer }),
}));
