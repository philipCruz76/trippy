"use client";
import { DailyItineraryType } from "@/lib/actions/chat/getDailyItinerary";
import { KeywordClassificationsType } from "@/lib/actions/chat/getKeywordClassifications";
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import { usePOIStore } from "@/lib/stores/poi-store";
import { useChatMessagesStore } from "@/lib/stores/chat-messages-store";
import { useCallback, useMemo } from "react";

type BodyProps = {
  keywords: KeywordClassificationsType;
  location: LatLngResult;
  itinerary: DailyItineraryType;
};

const Body = ({ keywords, location, itinerary }: BodyProps) => {
  const { messages, isLoading } = useChatMessagesStore();
  const { setMarkerId, setHoveredMarkerId } = usePOIStore();

  const renderMessages = () => {
    return messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-lg px-4 py-2 ${
            message.isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {message.text}
        </div>
      </div>
    ));
  };

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

  // Show loading indicator only when gathering information
  const showLoadingIndicator = isLoading && (!keywords.foundKeywords?.location || 
    !keywords.foundKeywords?.duration || 
    !keywords.foundKeywords?.activityTypes);

  return (
    <div className="flex flex-col space-y-4 p-4">
      {renderMessages()}
      
      {showLoadingIndicator && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 rounded-lg px-4 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Only show itinerary when we have all required information */}
      {keywords.foundKeywords?.location && 
       keywords.foundKeywords?.duration && 
       keywords.foundKeywords?.activityTypes && 
       itinerary.days && 
       itinerary.days.length > 0 && (
        <div className="border rounded-2xl hover:bg-gray-200 hover:bg-opacity-30 text-sm w-full h-fit items-start text-start justify-start overflow-hidden text-slate-600 py-1 px-4">
          <p>
            <br />
            {itinerary.summary} <br />
            <br />
          </p>
          {renderedDays}
        </div>
      )}
    </div>
  );
};

export default Body;
