"use client";
import { TripDetails } from "@/types/trip.types";
import ActivityTypeItem from "@/components/trips/ActivityTypeItem";
import TextareaAutosize from "react-textarea-autosize";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import { useEffect } from "react";

type TripOverviewProps = {
  overview: TripDetails["overview"];
  isOwner: boolean;
};

const TripOverview = ({ overview, isOwner }: TripOverviewProps) => {
  const { overviewSummary, setOverviewSummary, resetStore } =
    useTripEditorStore();

  // Initialize the summary in the store if it's not already set
  useEffect(() => {
    if (!overviewSummary && overview.summary) {
      setOverviewSummary(overview.summary);
    }
  }, [overview.summary, overviewSummary, setOverviewSummary]);

  useEffect(() => {
    if (!isOwner) return;
    return () => {
      resetStore();
    };
  }, []);
  return (
    <div className="py-9 border-t border-separator scroll-mt-[112px] max-w-[1200px] mx-auto px-4">
      <div className="relative z-0">
        <div className="flex-wrap items-start gap-7 flex">
          <div className="flex-1">
            {isOwner ? (
              <TextareaAutosize
                value={overviewSummary || overview.summary}
                onChange={(e) => setOverviewSummary(e.target.value)}
                placeholder="Add a summary for your trip..."
                className="w-full resize-none bg-transparent outline-none border rounded p-2 min-h-[100px] text-pretty leading-relaxed text-base text-gray-800 max-w-prose"
              />
            ) : (
              <p className="text-pretty leading-relaxed text-base text-gray-800 max-w-prose">
                {overview.summary}
              </p>
            )}
            <div className="shrink-0 bg-gradient-to-r from-transparent via-separator to-transparent h-px w-full my-9" />
            <h3 className="mb-6 text-2xl font-semibold leading-tight text-gray-900 tracking-tight">
              Places and Experiences
            </h3>
            <ul className="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3 gap-4">
              {overview.activityTypes.map((activityMap, index) => {
                const activityName = Object.keys(activityMap)[0];
                const activityCount = Object.values(activityMap)[0];
                return (
                  <li key={index}>
                    <ActivityTypeItem
                      activityName={activityName}
                      activityCount={activityCount}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripOverview;
