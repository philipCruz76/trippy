"use client";
import { DailyItineraryType } from "@/lib/actions/chat/getDailyItinerary";
import { KeywordClassificationsType } from "@/lib/actions/chat/getKeywordClassifications";
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import { usePOIStore } from "@/lib/stores/poi-store";
import { useCallback, useMemo } from "react";

type BodyProps = {
  keywords: KeywordClassificationsType;
  location: LatLngResult;
  itinerary: DailyItineraryType;
};

const Body = ({ keywords, location, itinerary }: BodyProps) => {
  const { setMarkerId, setHoveredMarkerId } = usePOIStore();

  const activityNames = useCallback((day: DailyItineraryType["days"][0]) => 
    day.activities.map((activity) => activity.name),
    []
  );

  const createSafeRegex = useCallback((activityNames: string[]) => {
    const safeNames = activityNames
      .filter((name) => name.trim() !== "")
      .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return new RegExp(`\\b(${safeNames.join("|")})\\b`, "gi");
  }, []);

  const handlePointerEnter = useCallback(
    (id: string) => () => {
      setMarkerId(id);
      setHoveredMarkerId(id);
    },
    [setMarkerId, setHoveredMarkerId]
  );

  const handlePointerLeave = useCallback(() => {
    setMarkerId("");
    setHoveredMarkerId("");
  }, [setMarkerId, setHoveredMarkerId]);

  const renderDay = useCallback((day: DailyItineraryType["days"][0]) => {
    const regex = createSafeRegex(activityNames(day));
    const dailyExplainer = day.description.split(regex);
    const activityMap = new Map(
      day.activities.map(activity => [activity.name.toLowerCase(), activity])
    );

    return (
      <div key={day.title}>
        <p>
          {" "}
          {day.title}
          <br />
          <br />
        </p>

        <p>
          {dailyExplainer.map((part, index) => {
            const normalizedPart = part.toLowerCase();
            const activity = activityMap.get(normalizedPart);
            return activity ? (
              <a
                key={`${day.title}-${index}`}
                onPointerEnter={handlePointerEnter(activity.id)}
                onPointerLeave={handlePointerLeave}
                className="text-black font-semibold cursor-pointer"
              >
                {part}
              </a>
            ) : (
              part.replace(/\*/g, "")
            );
          })}
          <br />
          <br />
        </p>
      </div>
    );
  }, [activityNames, createSafeRegex, handlePointerEnter, handlePointerLeave]);

  const renderedDays = useMemo(() => 
    itinerary.days?.map(renderDay),
    [itinerary.days, renderDay]
  );

  return (
    <div className="flex flex-col gap-2 px-2 h-fit w-[45dvw]">
      <div className="border rounded-2xl hover:bg-gray-200 hover:bg-opacity-30 text-sm w-full h-fit items-start text-start justify-start overflow-x-scroll text-slate-600 py-1 px-4">
        <span>
          Location:{keywords.location} <br />
          Duration: {keywords.duration} <br />
          Activity:{keywords.activity} <br />
          Included_Types:{`${keywords.activityTypes.join(",")}`} <br />
          Excluded_Types:{`${keywords.excludedTypes?.join(",")}`}
        </span>
      </div>
      <div className="border rounded-2xl hover:bg-gray-200 hover:bg-opacity-30 text-sm w-full items-start text-start justify-start overflow-hidden text-slate-600 py-1 px-4">
        {`Lat: ${location.lat}, Lng: ${location.lng}`}
      </div>
      {itinerary.days && itinerary.days.length > 0 ? (
        <div className="border rounded-2xl hover:bg-gray-200 hover:bg-opacity-30 text-sm w-full h-fit items-start text-start justify-start overflow-hidden text-slate-600 py-1 px-4">
          <p>
            <br />
            {itinerary.summary} <br />
            <br />
          </p>
          {renderedDays}
        </div>
      ) : null}
    </div>
  );
};

export default Body;
