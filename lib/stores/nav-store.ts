import { create } from "zustand";

type NavStoreState = {
  showNav: boolean;
  setShowNav: (showNav: boolean) => void;
};

export const useNavDrawerStore = create<NavStoreState>()((set) => ({
  showNav: false,
  setShowNav: (showNav: boolean) => set({ showNav }),
}));
