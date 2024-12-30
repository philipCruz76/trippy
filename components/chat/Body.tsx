"use client";
import { DailyItineraryType } from "@/lib/actions/chat/getDailyItinerary";
import { KeywordClassificationsType } from "@/lib/actions/chat/getKeywordClassifications";
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import { usePOIStore } from "@/lib/stores/poi-store";
import { useChatMessagesStore } from "@/lib/stores/chat-messages-store";
import { useCallback, useMemo, useRef, useEffect } from "react";

type BodyProps = {
  keywords: KeywordClassificationsType;
  location: LatLngResult;
  itinerary: DailyItineraryType;
  showItinerary: boolean;
};

const Body = ({ keywords, location, itinerary, showItinerary }: BodyProps) => {
  const { messages, isLoading } = useChatMessagesStore();
  const { setMarkerId, setHoveredMarkerId } = usePOIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const renderMessages = () => {
    return messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${
          message.isUser ? "justify-end" : "justify-start"
        } mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
            message.isUser
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {message.text}
        </div>
      </div>
    ));
  };

  const activityNames = useCallback(
    (day: DailyItineraryType["days"][0]) =>
      day.activities.map((activity) => activity.name),
    [],
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
    [setMarkerId, setHoveredMarkerId],
  );

  const handlePointerLeave = useCallback(() => {
    setMarkerId("");
    setHoveredMarkerId("");
  }, [setMarkerId, setHoveredMarkerId]);

  const renderDay = useCallback(
    (day: DailyItineraryType["days"][0]) => {
      const regex = createSafeRegex(activityNames(day));
      const dailyExplainer = day.description.split(regex);
      const activityMap = new Map(
        day.activities.map((activity) => [
          activity.name.toLowerCase(),
          activity,
        ]),
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
    },
    [activityNames, createSafeRegex, handlePointerEnter, handlePointerLeave],
  );

  const renderedDays = useMemo(
    () => itinerary.days?.map(renderDay),
    [itinerary.days, renderDay],
  );

  return (
    <div className="flex flex-col-reverse h-full overflow-y-auto p-4">
      <div className="flex flex-col space-y-4">
        {/* Loading indicator */}
        {isLoading && (
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

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            } mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {/* Itinerary */}
        {showItinerary && itinerary.days && itinerary.days.length > 0 && (
          <div className="flex flex-col h-fti justify-start max-w-[70%] rounded-2xl px-4 py-2 mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300 bg-gray-100 text-gray-800">
            <p>
              <br />
              {itinerary.summary} <br />
              <br />
            </p>
            {renderedDays}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Body;
