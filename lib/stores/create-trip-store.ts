import { create } from "zustand";
import { produce } from "immer";
import { ActivityType, DailyActivitesType } from "@/types/trip.types";

export type TripCreatorState = {
  title: string;
  location: string;
  duration: number;
  overview?: {
    summary: string;
    activityTypes: Record<string, number>[];
  };
  itinerary?: {
    title?: string;
    days?: DailyActivitesType[];
    comment?: string;
  };
};
type Actions = {
  setTitle: (title: string) => void;
  setLocation: (location: string) => void;
  setDuration: (duration: number) => void;
  setItinerary: (itinerary: TripCreatorState["itinerary"]) => void;
  addActivity: (activity: ActivityType, index: number) => void;
  removeActivity: (index: number) => void;
  setComment: (comment: string) => void;
  updateActivityDuration: (
    dayIndex: number,
    activityIndex: number,
    durationFrom: string,
    durationTo: string,
  ) => void;
  resetStore: () => void;
  setOverview: (overview: TripCreatorState["overview"]) => void;
};

export const useTripCreatorStore = create<TripCreatorState & Actions>(
  (set) => ({
    title: "",
    location: "",
    duration: 0,
    overview: undefined,
    itinerary: undefined,

    setTitle: (title) => set({ title }),
    setLocation: (location) => set({ location }),
    setDuration: (duration) => set({ duration }),
    setItinerary: (itinerary) =>
      set(
        produce((state) => {
          state.itinerary = itinerary;
        }),
      ),
    addActivity: (activity, dayIndex) =>
      set(
        produce((state) => {
          // Initialize itinerary if it doesn't exist
          if (!state.itinerary) {
            state.itinerary = { days: [] };
          }

          // If days array is empty, initialize it with one day
          if (!state.itinerary.days || state.itinerary.days.length === 0) {
            state.itinerary.days = [{ dailyActivities: [] }];
            dayIndex = 0; // Force dayIndex to 0 for the first activity
          }

          // Ensure the day exists
          while (state.itinerary.days.length <= dayIndex) {
            state.itinerary.days.push({ dailyActivities: [] });
          }

          state.itinerary.days[dayIndex].dailyActivities.push(activity);
        }),
      ),
    removeActivity: (index) =>
      set(
        produce((state) => ({
          itinerary: {
            ...state.itinerary,
            activities: state.itinerary?.activities?.filter(
              (_: any, i: number) => i !== index,
            ),
          },
        })),
      ),
    setComment: (comment) =>
      set(
        produce((state) => ({
          itinerary: {
            ...state.itinerary,
            comment: comment,
          },
        })),
      ),
    updateActivityDuration: (
      dayIndex,
      activityIndex,
      durationFrom,
      durationTo,
    ) =>
      set(
        produce((state) => {
          if (
            state.itinerary?.days?.[dayIndex]?.dailyActivities?.[activityIndex]
          ) {
            state.itinerary.days[dayIndex].dailyActivities[
              activityIndex
            ].durationFrom = durationFrom;
            state.itinerary.days[dayIndex].dailyActivities[
              activityIndex
            ].durationTo = durationTo;
          }
        }),
      ),
    resetStore: () =>
      set({
        title: "",
        location: "",
        duration: 0,
        overview: undefined,
        itinerary: undefined,
      }),
    setOverview: (overview) => set({ overview }),
  }),
);
