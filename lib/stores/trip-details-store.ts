import { create } from "zustand";
import { produce } from "immer";
import { TripDetails } from "@/types/trip.types";

type TripDetailsActions = {
  setUsername: (username: string) => void;
  setLocation: (location: string) => void;
  setCoverPhoto: (coverPhoto: string) => void;
  setDuration: (duration: number) => void;
  setOverview: (overview: TripDetails["overview"]) => void;
  setDailyTrip: (dailyTrip: TripDetails["itinerary"]["dailyTrip"]) => void;
  setLocationTrip: (
    locationTrip: TripDetails["itinerary"]["locationTrip"],
  ) => void;
  updateDailyTripOverview: (
    dayIndex: number,
    overview: TripDetails["itinerary"]["dailyTrip"][0]["overview"],
  ) => void;
  addActivity: (
    dayIndex: number,
    activity: TripDetails["itinerary"]["dailyTrip"][0]["itinerary"][0]["activities"][0],
  ) => void;
  removeActivity: (dayIndex: number, activityIndex: number) => void;
  setBatchDetails: (details: Partial<Omit<TripDetails, keyof TripDetailsActions>>) => void;
};

export const useTripDetailsStore = create<TripDetails & TripDetailsActions>()(
  (set) => ({
    title: "",
    username: "",
    location: "",
    coverPhoto: "",
    duration: 0,
    overview: {
      summary: "",
      activityTypes: [],
    },
    itinerary: {
      dailyTrip: [],
      locationTrip: [],
    },

    setUsername: (username) => set({ username }),

    setLocation: (location) => set({ location }),

    setDuration: (duration) => set({ duration }),

    setOverview: (overview) => set({ overview }),
    setCoverPhoto: (coverPhoto) => set({ coverPhoto }),

    setDailyTrip: (dailyTrip) =>
      set(
        produce((state) => {
          state.itinerary.dailyTrip = dailyTrip;
        }),
      ),

    setLocationTrip: (locationTrip) =>
      set(
        produce((state) => {
          state.itinerary.locationTrip = locationTrip;
        }),
      ),

    updateDailyTripOverview: (dayIndex, overview) =>
      set(
        produce((state) => {
          if (state.itinerary.dailyTrip[dayIndex]) {
            state.itinerary.dailyTrip[dayIndex].overview = overview;
          }
        }),
      ),

    addActivity: (dayIndex, activity) =>
      set(
        produce((state) => {
          if (state.itinerary.dailyTrip[dayIndex]?.itinerary[0]) {
            state.itinerary.dailyTrip[dayIndex].itinerary[0].activities.push(
              activity,
            );
          }
        }),
      ),

    removeActivity: (dayIndex, activityIndex) =>
      set(
        produce((state) => {
          if (state.itinerary.dailyTrip[dayIndex]?.itinerary[0]) {
            state.itinerary.dailyTrip[dayIndex].itinerary[0].activities.splice(
              activityIndex,
              1,
            );
          }
        }),
      ),

    setBatchDetails: (details) =>
      set((state) => ({
        ...state,
        ...details
      })),
  }),
);
