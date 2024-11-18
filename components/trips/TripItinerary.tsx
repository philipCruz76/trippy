
import { TripDetails } from "@/types/trip.types";
import Carousel from "../ui/Carousel";

type TripItineraryProps = {
  itinerary: TripDetails["itinerary"];
};

const TripItinerary = ({ itinerary }: TripItineraryProps) => {
  return (
    <div className="py-9 border-t border-separator scroll-mt-[80px]">
      <h3 className="mb-3 text-4xl font-semibold text-center leading-tight">
        Itinerary
      </h3>
      <p className="text-center">{itinerary.dailyTrip.length} days</p>

      <ul className="flex flex-col gap-20">
        {itinerary.dailyTrip.map((day, dayIndex) => (
          <li key={dayIndex} className="flex flex-col gap-9">
            {/* Day Header */}
            <div>
              <div className="mb-2.5 flex items-center">
                <h3 className="text-3xl font-semibold">Day {dayIndex + 1}</h3>
              </div>
              <div className="flex">
                <h4 className="text-pretty text-lg font-medium">
                  {day.itinerary[dayIndex].title}
                </h4>
              </div>
            </div>

            {/* Day Activities */}
            {day.itinerary[dayIndex].activities.map((activity, actIndex) => (
              <div key={actIndex} className="grid items-start grid-cols-2 gap-9">
                <div className="top-[calc(var(--header-height)*2+theme(space.4))] sticky">
                  <div className="relative overflow-hidden group rounded-2xl aspect-auto h-[31.25rem]">
                    <Carousel slides={activity.photos} asPhotosOnly size="large" />
                  </div>
                </div>
                <div className="col-start-2">
                  <div className="shrink-0 bg-separator h-px w-full mb-6 block" />
                  <div className="mb-2 flex items-start gap-2.5">
                    <h4 className="flex-1 text-pretty text-xl font-semibold @2xl/detail:text-2xl">
                      <span className="underline-offset-2 hover:underline">
                        {activity.activityName}
                      </span>
                    </h4>
                  </div>
                  <div className="flex gap-1 leading-tight mb-2 text-muted">
                    <span className="capitalize text-gray-500 text-sm">
                      {activity.activityType}
                    </span>
                  </div>
                  <p>{activity.time || ""}</p>
                  <div className="shrink-0 bg-separator h-px w-full my-5 @lg:my-6" />
                  <div className="text-pretty pb-9 leading-relaxed">
                    <p>{activity.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripItinerary;
