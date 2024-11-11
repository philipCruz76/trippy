import { ActivityType } from "@/types/trip.types";
import { create } from "zustand";
import { produce } from "immer";

type TripEditorSate = {
  showEditor: boolean;
  showWizard: boolean;
  tripActivities: ActivityType[][];
  setShowEditor: (showEditor: boolean) => void;
  setShowWizard: (showWizard: boolean) => void;
  setTripActivities: (tripActivities: ActivityType[][]) => void;
  addActivity: (activity: ActivityType, dayIndex: number) => void;
  updateActivity: (
    activity: Partial<ActivityType>,
    dayIndex: number,
    activityIndex: number,
  ) => void;
  removeActivity: (dayIndex: number, activityIndex: number) => void;
  moveActivity: (
    fromDayIndex: number,
    toDayIndex: number,
    fromActivityIndex: number,
    toActivityIndex: number,
  ) => void;
};

export const useTripEditorStore = create<TripEditorSate>()((set) => ({
  showEditor: false,
  showWizard: false,
  tripActivities: [],

  setShowEditor: (showEditor: boolean) => set({ showEditor }),
  setShowWizard: (showWizard: boolean) => set({ showWizard }),

  setTripActivities: (tripActivities: ActivityType[][]) =>
    set({ tripActivities }),

  addActivity: (activity: ActivityType, dayIndex: number) =>
    set(
      produce((state) => {
        // If tripActivities is empty, initialize it with one day
        if (state.tripActivities.length === 0) {
          state.tripActivities = [[]];
          dayIndex = 0; // Force dayIndex to 0 for the first activity
        }

        // Ensure the day exists
        while (state.tripActivities.length <= dayIndex) {
          state.tripActivities.push([]);
        }

        state.tripActivities[dayIndex].push(activity);
      }),
    ),

  updateActivity: (
    activity: Partial<ActivityType>,
    dayIndex: number,
    activityIndex: number,
  ) =>
    set(
      produce((state) => {
        if (!state.tripActivities[dayIndex]?.[activityIndex]) {
          return;
        }

        state.tripActivities[dayIndex][activityIndex] = {
          ...state.tripActivities[dayIndex][activityIndex],
          ...activity,
        };
      }),
    ),

  removeActivity: (dayIndex: number, activityIndex: number) =>
    set(
      produce((state) => {
        if (!state.tripActivities[dayIndex]) {
          return;
        }

        state.tripActivities[dayIndex].splice(activityIndex, 1);
      }),
    ),

  moveActivity: (
    fromDayIndex: number,
    toDayIndex: number,
    fromActivityIndex: number,
    toActivityIndex: number,
  ) =>
    set(
      produce((state) => {
        const fromDay = state.tripActivities[fromDayIndex];
        const toDay = state.tripActivities[toDayIndex];

        if (!fromDay?.[fromActivityIndex] || !toDay) {
          return;
        }

        // Remove from original position
        const [movedActivity] = fromDay.splice(fromActivityIndex, 1);

        // Ensure target day exists
        while (state.tripActivities.length <= toDayIndex) {
          state.tripActivities.push([]);
        }

        // Insert at new position
        state.tripActivities[toDayIndex].splice(
          toActivityIndex,
          0,
          movedActivity,
        );
      }),
    ),
}));
