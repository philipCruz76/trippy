"use client";
import { useEffect, useState } from "react";
import Body from "@/components/chat/Body";
import ChatBox from "@/components/chat/ChatBox";
import TripEditor from "@/components/itinerary/TripEditor";
import { useGPTResponseStore } from "@/lib/stores/gpt-response-store";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { useSession } from "next-auth/react";
import MapBoxAIViewWrapper from "@/components/maps/MapBoxAIView";
import { useMediaQuery } from "react-responsive";
import { Map, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

const page = () => {
  const { keywords, geoLocation, dailyItinerary } = useGPTResponseStore();
  const { setOverview } = useTripCreatorStore();
  const [checkForEmpty, setCheckForEmpty] = useState<boolean>(true);
  const [finalResult, setFinalResult] = useState<boolean>(false);
  const { data: session } = useSession();
  const [showMap, setShowMap] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const router = useRouter();

  useEffect(() => {
    if(!session) {
      router.push("/");
    }
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return <div className="flex flex-1 max-h-[100dvh] max-w-[100dvw]" />;
  }


  return (
    <div className="flex flex-1 max-h-[100dvh] max-w-[100dvw] flex-row relative">
      {/* Map Component */}
      <div
        className={`${
          isMobile
            ? `fixed inset-0 z-10 transition-transform duration-300 ${
                showMap ? "translate-y-0" : "translate-y-full"
              }`
            : "fixed border inset-0 overflow-hidden top-[60px] z-1 max-h-[100dvh] max-w-[100dvw] rounded-2xl left-1/2"
        }`}
      >
        {(!checkForEmpty || geoLocation.lat !== 0) && (
          <MapBoxAIViewWrapper
            city={geoLocation}
            searchTypes={{
              includedTypes: keywords.activityTypes,
              excludedTypes: keywords.excludedTypes,
            }}
          />
        )}
      </div>

      {/* Chat Component */}
      <div
        className={` overscroll-none ${
          isMobile
            ? `w-[100dvw] max-w-[100dvw] max-h-[100dvh] ${showMap ? "hidden" : "flex flex-1"}`
            : "flex flex-1 max-w-[50dvw]"
        } min-h-[100dvh] pt-[66px] flex-col overflow-y-scroll bg-background  transition-transform duration-300 ${
          isMobile && showMap ? "translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Header Area */}
        <div className=" flex flex-col duration-300 animate-in fade-in">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
            <div className="flex w-full flex-1 flex-col">
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
        <div className="flex flex-col flex-1 overflow-y-auto max-h-[95dvh] pb-10">
          <Body
            keywords={keywords}
            location={geoLocation}
            itinerary={dailyItinerary}
            showItinerary={finalResult}
          />
        </div>

        {/* Chat Input Box */}
        <div className="absolute inset-x-0 bottom-0 z-1 pb-[24px] bg-background/80 backdrop-blur-md">
          <div className="mx-auto w-full max-w-3xl mobile:px-5">
            <div className="relative">
              <ChatBox />
            </div>
          </div>
        </div>
      </div>

      {/* Move Toggle Button outside the chat component */}
      {isMobile && geoLocation.lat !== 0 && (
        <button
          onClick={() => setShowMap(!showMap)}
          className="fixed bottom-24 right-4 z-[50] bg-primary text-white p-3 rounded-full shadow-lg"
        >
          {showMap ? (
            <MessageSquare className="w-6 h-6" />
          ) : (
            <Map className="w-6 h-6" />
          )}
        </button>
      )}

      <TripEditor />
    </div>
  );
};

export default page;
