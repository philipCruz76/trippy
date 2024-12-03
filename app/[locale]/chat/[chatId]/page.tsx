"use client";
import Body from "@/components/chat/Body";
import ChatBox from "@/components/chat/ChatBox";
import TripEditor from "@/components/itinerary/TripEditor";
import GoogleMapsAIView from "@/components/maps/GoogleMapsAIView";
import { useGPTResponseStore } from "@/lib/stores/gpt-response-store";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import MapBoxAIViewWrapper from "@/components/maps/MapBoxAIView";

type pageProps = {};

const page = ({}: pageProps) => {
  const { keywords, geoLocation, dailyItinerary, gptInteractionStarted } =
    useGPTResponseStore();
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

    // When finalResult becomes true, set the overview in TripCreatorStore
    setOverview({
      summary: dailyItinerary.summary,
      activityTypes: [] // This can be populated if needed
    });
  }, [dailyItinerary, setOverview]);

  return (
    <div className="flex flex-1 max-h-[100dvh] max-w-[100dvw] flex-row">
      {/* Chat Map  */}
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
        <div className="flex ] flex-1 flex-col duration-300 animate-in fade-in">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-[--sheet-pad] pb-16 pt-[calc(var(--header-height)+theme(space.4))] @container split:pb-7">
            <div className="flex w-full flex-1 flex-col pb-7">
              <div className="flex flex-col gap-5 pb-7">
                <h2 className="text-2xl font-semibold mobile:text-3xl split:text-4xl tracking-tight">
                  Where to Today {session?.user.name ? ` ${session?.user.name}` : ` ${session?.user.username}`}?
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* AI Functionality */}
        <div className="flex flex-1 min-h-[800px] overflow-y-auto max-w-[50dvw] pb-3">
        {gptInteractionStarted ? (
            <div className="relative z-1 mt-4 desktop:mt-0">
              <span className="relative flex shrink-0 rounded-full size-[20px] text-[.5625rem] font-semibold tracking-tight">
                <span className="flex size-full select-none items-center justify-center rounded-full uppercase bg-foreground text-background">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    className="w-[16px] h-[16px]"
                    fill="#feffff"
                    viewBox="0 0 256 256"
                  >
                    <path d="M176,216a8,8,0,0,1-8,8H24a8,8,0,0,1,0-16H168A8,8,0,0,1,176,216ZM247.86,93.15a8,8,0,0,1-3.76,5.39l-147.41,88a40.18,40.18,0,0,1-20.26,5.52,39.78,39.78,0,0,1-27.28-10.87l-.12-.12L13,145.8a16,16,0,0,1,4.49-26.21l3-1.47a8,8,0,0,1,6.08-.4l28.26,9.54L75,115.06,53.17,93.87A16,16,0,0,1,57.7,67.4l.32-.13,7.15-2.71a8,8,0,0,1,5.59,0L124.7,84.38,176.27,53.6a39.82,39.82,0,0,1,51.28,9.12l.12.15,18.64,23.89A8,8,0,0,1,247.86,93.15Zm-19.74-3.7-13-16.67a23.88,23.88,0,0,0-30.68-5.42l-54.8,32.72a8.06,8.06,0,0,1-6.87.64L68,80.58l-4,1.53.21.2L93.57,110.8a8,8,0,0,1-1.43,12.58L59.93,142.87a8,8,0,0,1-6.7.73l-28.67-9.67-.19.1-.37.17a.71.71,0,0,1,.13.12l36,35.26a23.85,23.85,0,0,0,28.42,3.18Z"></path>
                  </svg>
                </span>
              </span>
            </div>
          ) : null}
          {finalResult ? (
            <Body
              keywords={keywords}
              location={geoLocation}
              itinerary={dailyItinerary}
            />
          ) : gptInteractionStarted ? (
            <div className=" gap-2 px-4">
              <div className="border rounded-2xl hover:bg-gray-200 hover:bg-opacity-30 text-sm w-full h-[20px]  overflow-hidden text-slate-600 py-2 px-4">
                <div className="flex gap-1">
                  <span className="w-[6px] h-[6px] bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-[6px] h-[6px] bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-[6px] h-[6px] bg-gray-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          ) : null}
          
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
