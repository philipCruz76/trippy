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
            {day.itinerary.map((item, index) => (
              <div key={index}>
                {/* Day Header */}
                <div className={`${dayIndex % 2 === 1 ? 'text-right' : ''}`}>
                  <div className="mb-2.5 flex items-center justify-start">
                    <h3 className={`text-pretty text-3xl font-semibold ${dayIndex % 2 === 1 ? 'ml-auto' : ''}`}>{item.title}</h3>
                  </div>
                  
                </div>
                
                {/* Day Activities */}
                {item.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="grid items-start grid-cols-2 gap-9">
                    {dayIndex % 2 === 0 ? (
                      <>
                        <div className="top-[calc(var(--header-height)*2+theme(space.4))] sticky">
                          <div className="relative overflow-hidden group rounded-2xl aspect-auto h-[31.25rem]">
                            <Carousel 
                              slides={activity.photos.map(photo => ({
                                url: photo,
                                isLoading: false,
                                width: undefined,
                                height: undefined
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
                        <div className="col-start-2 top-[calc(var(--header-height)*2+theme(space.4))] sticky">
                          <div className="relative overflow-hidden group rounded-2xl aspect-auto h-[31.25rem]">
                            <Carousel 
                              slides={activity.photos.map(photo => ({
                                url: photo,
                                isLoading: false,
                                width: undefined,
                                height: undefined
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
