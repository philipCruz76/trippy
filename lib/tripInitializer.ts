import { ActivityType } from "@/types/trip.types";
import { useTripCreatorStore } from "./stores/create-trip-store";
import { useTripEditorStore } from "./stores/trip-editor-store";

export function itineraryToTripMapper(
  activities: {
    id: string;
    name: string;
    coverPhoto?: string | undefined;
    activityType?: string | undefined;
  }[],
  title: string,
  location: string,
  duration: string,
) {
  const { setTitle, setLocation, setDuration, setItinerary } =
    useTripCreatorStore();
  const { setShowEditor } = useTripEditorStore();
  let parsedActivities: ActivityType[] = [];

  activities.forEach((activity) => {
    parsedActivities.push({
        dailyActivities: [{
            title: activity.name,
            cover: activity.coverPhoto,
            manualInput: false,
            activityType: activity.activityType,
        }]
    });
});

  const initializeTrip = () => {
    setTitle(title);
    setLocation(location);
    setDuration(parseInt(duration));
    setItinerary({
      days: parsedActivities,
    });
  };

  initializeTrip();
  setShowEditor(true);
}
