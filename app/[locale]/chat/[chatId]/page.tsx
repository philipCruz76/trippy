"use client";
import Body from "@/components/chat/Body";
import ChatBox from "@/components/chat/ChatBox";
import TripEditor from "@/components/itinerary/TripEditor";
import { useGPTResponseStore } from "@/lib/stores/gpt-response-store";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import MapBoxAIViewWrapper from "@/components/maps/MapBoxAIView";
import { useChatMessagesStore } from "@/lib/stores/chat-messages-store";

type pageProps = {};

const page = ({}: pageProps) => {
  const { keywords, geoLocation, dailyItinerary, gptInteractionStarted } =
    useGPTResponseStore();
  const { messages } = useChatMessagesStore();
  const { setOverview } = useTripCreatorStore();
  const [checkForEmpty, setCheckForEmpty] = useState<boolean>(true);
  const [finalResult, setFinalResult] = useState<boolean>(false);
  const { data: session } = useSession();

  useEffect(() => {
    setCheckForEmpty(geoLocation.lat === 0);
  }, [geoLocation]);

  useEffect(() => {
    if (!dailyItinerary.summary) return;
    setFinalResult(true);

    setOverview({
      summary: dailyItinerary.summary,
      activityTypes: [],
    });
  }, [dailyItinerary, setOverview]);

  return (
    <div className="flex flex-1 max-h-[100dvh] max-w-[100dvw] flex-row">
      {/* Chat Map */}
      {!checkForEmpty || geoLocation.lat !== 0 ? (
        <div
          dir="ltr"
          className="absolute border inset-0 overflow-hidden top-[60px] z-1 max-h-[88dvh] max-w-[49dvw] rounded-2xl left-1/2"
        >
          <MapBoxAIViewWrapper
            city={geoLocation}
            searchTypes={{
              includedTypes: keywords.activityTypes,
              excludedTypes: keywords.excludedTypes,
            }}
          />
        </div>
      ) : null}

      {/* AI Chat */}
      <div className="flex flex-1 grow overscroll-none max-w-[50dvw] max-h-[100dvh] flex-col overflow-y-scroll bg-background pt-[60px] transition-opacity duration-500 mt-[60px] pl-4">
        {/* Header Area */}
        <div className="flex flex-1 flex-col duration-300 animate-in fade-in">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-[--sheet-pad] pb-16 pt-[calc(var(--header-height)+theme(space.4))] @container split:pb-7">
            <div className="flex w-full flex-1 flex-col pb-7">
              <div className="flex flex-col gap-5 pb-7">
                <h2 className="text-2xl font-semibold mobile:text-3xl split:text-4xl tracking-tight">
                  Where to Today{" "}
                  {session?.user.name
                    ? ` ${session?.user.name}`
                    : ` ${session?.user.username}`}
                  ?
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages and Functionality */}
        <div className="flex flex-1 min-h-[800px] overflow-y-auto max-w-[50dvw] pb-3">
          <Body
            keywords={keywords}
            location={geoLocation}
            itinerary={dailyItinerary}
            showItinerary={finalResult}
          />
        </div>

        {/* Chat Input Box */}
        <div className="sticky inset-x-0 bottom-0 z-1 pb-[24px] bg-background/80 backdrop-blur-md">
          <div className="mx-auto w-full max-w-3xl mobile:px-5">
            <div className="relative">
              <ChatBox />
            </div>
          </div>
        </div>
      </div>
      <TripEditor />
    </div>
  );
};

export default page;
