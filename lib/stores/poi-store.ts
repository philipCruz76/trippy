import { create } from "zustand";
import { produce } from "immer";

type POIStore = {
  ids: string[];
  markerId: string;
  setIds: (ids: string[]) => void;
  setMarkerId: (markerId: string) => void;
};

export const usePOIStore = create<POIStore>()((set) => ({
  ids: [""],
  markerId: "",
  setIds(ids) {
    set(
      produce((state) => {
        state.ids = ids;
      }),
    );
  },
  setMarkerId(markerId) {
    set(
      produce((state) => {
        state.markerId = markerId;
      }),
    );
  },
}));
