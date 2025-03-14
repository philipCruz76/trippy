import { TripDetails } from "@/types/trip.types";
import Carousel from "../ui/Carousel";
import TextareaAutoSize from "react-textarea-autosize";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import { useEffect } from "react";
import { activityTypeIconSelector } from "@/lib/utils/map-utils";
import Image from "next/image";

type TripItineraryProps = {
  itinerary: TripDetails["itinerary"];
  isOwner: boolean;
};

const TripItinerary = ({ itinerary, isOwner }: TripItineraryProps) => {
  const { updateActivitySummary, setTripActivities, tripActivities } =
    useTripEditorStore();

  // Sync initial data with store on mount
  useEffect(() => {
    if (!isOwner) return;
    const activities = itinerary.dailyTrip.map((day) =>
      day.itinerary
        .map((item) =>
          item.activities.map((activity) => ({
            ...activity,
            title: activity.activityName,
            id: activity.place_id,
            activityType: activity.activityType || "",
          })),
        )
        .flat(),
    );
    setTripActivities(activities);
  }, [itinerary, setTripActivities, isOwner]);

  // Get activity summary from store or fallback to initial data
  const getActivitySummary = (dayIndex: number, actIndex: number) => {
    return (
      tripActivities[dayIndex]?.[actIndex]?.summary ||
      itinerary.dailyTrip[dayIndex]?.itinerary[0]?.activities[actIndex]
        ?.summary ||
      ""
    );
  };

  // Add this function to render the activity type with icon
  const renderActivityTypeWithIcon = (activityType: string) => {
    const icon = activityTypeIconSelector(activityType);

    return (
      <div className="flex items-center gap-2">
        <Image
          src={icon.src}
          alt={icon.alt}
          width={16}
          height={16}
          className="shrink-0"
        />
        <span className="capitalize text-gray-500 text-sm">{activityType}</span>
      </div>
    );
  };

  return (
    <div className="py-9 border-t border-separator scroll-mt-[112px] min-h-screen">
      <h3 className="mb-3 text-4xl font-semibold text-center leading-tight">
        Itinerary
      </h3>
      <p className="text-center">{itinerary.dailyTrip.length} days</p>

      <ul className="flex flex-col gap-20">
        {itinerary.dailyTrip.map((day, dayIndex) => (
          <li key={dayIndex} className="flex flex-col gap-9">
            {day.itinerary.map((item, index) => (
              <div key={index}>
                {/* Day Header */}
                <div className={`${dayIndex % 2 === 1 ? "text-right" : ""}`}>
                  <div className="mb-2.5 flex items-center justify-start">
                    <h3
                      className={`text-pretty text-3xl font-semibold ${dayIndex % 2 === 1 ? "ml-auto" : ""}`}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Day Activities */}
                {item.activities.map((activity, actIndex) => (
                  <div
                    key={actIndex}
                    className="grid items-start grid-cols-2 gap-9"
                  >
                    {dayIndex % 2 === 0 ? (
                      <>
                        <div className="top-[calc(var(--header-height)*2+theme(space.4))] sticky">
                          <div className="relative overflow-hidden group rounded-2xl aspect-auto h-[20rem] desktop:h-[31.25rem] py-[8px]">
                            <Carousel
                              slides={activity.photos.map((photo) => ({
                                url: photo,
                                isLoading: false,
                                width: undefined,
                                height: undefined,
                              }))}
                              asPhotosOnly
                              size="large"
                            />
                          </div>
                        </div>
                        <div className="col-start-2">
                          {/* Content section */}
                          <div className="shrink-0 bg-separator h-px w-full mb-6 block" />
                          <div className="mb-2 flex items-start gap-2.5">
                            <h4 className="flex-1 text-pretty text-xl font-semibold @2xl/detail:text-2xl">
                              <span className="underline-offset-2 hover:underline">
                                {activity.activityName}
                              </span>
                            </h4>
                          </div>
                          <div className="flex gap-1 leading-tight mb-2 text-muted">
                            {renderActivityTypeWithIcon(activity.activityType!)}
                          </div>
                          <p>{activity.time || ""}</p>
                          <div className="shrink-0 bg-separator h-px w-full my-5 desktop:my-6" />
                          <div className="text-pretty pb-9 leading-relaxed">
                            {isOwner === true ? (
                              <TextareaAutoSize
                                value={getActivitySummary(dayIndex, actIndex)}
                                onChange={(e) => {
                                  updateActivitySummary(
                                    dayIndex,
                                    actIndex,
                                    e.target.value,
                                  );
                                }}
                                placeholder="Add a summary for this activity..."
                                className="w-full resize-none bg-transparent outline-none border rounded p-2 min-h-[100px] scrollbar-hide"
                              />
                            ) : (
                              <p>{activity.summary || ""}</p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-start-1">
                          {/* Content section */}
                          <div className="shrink-0 bg-separator h-px w-full mb-6 block" />
                          <div className="mb-2 flex items-start gap-2.5">
                            <h4 className="flex-1 text-pretty text-xl font-semibold @2xl/detail:text-2xl">
                              <span className="underline-offset-2 hover:underline">
                                {activity.activityName}
                              </span>
                            </h4>
                          </div>
                          <div className="flex gap-1 leading-tight mb-2 text-muted">
                            {renderActivityTypeWithIcon(activity.activityType!)}
                          </div>
                          <p>{activity.time || ""}</p>
                          <div className="shrink-0 bg-separator h-px w-full my-5 desktop:my-6" />
                          <div className="text-pretty pb-9 leading-relaxed">
                            {isOwner === true ? (
                              <TextareaAutoSize
                                value={getActivitySummary(dayIndex, actIndex)}
                                onChange={(e) => {
                                  updateActivitySummary(
                                    dayIndex,
                                    actIndex,
                                    e.target.value,
                                  );
                                }}
                                placeholder="Add a description..."
                                className="w-full resize-none bg-transparent outline-none border rounded p-2 min-h-[100px] scrollbar-hide"
                              />
                            ) : (
                              <p>{activity.summary || ""}</p>
                            )}
                          </div>
                        </div>
                        <div className="col-start-2 top-[calc(var(--header-height)*2+theme(space.4))] sticky">
                          <div className="relative overflow-hidden group rounded-2xl aspect-auto h-[20rem] desktop:h-[31.25rem] py-[8px]">
                            <Carousel
                              slides={activity.photos.map((photo) => ({
                                url: photo,
                                isLoading: false,
                                width: undefined,
                                height: undefined,
                              }))}
                              asPhotosOnly
                              size="large"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripItinerary;
