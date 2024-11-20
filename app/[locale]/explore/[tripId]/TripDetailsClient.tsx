"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import TripBanner from "@/components/trips/TripBanner";
import TripNavigation from "@/components/trips/TripNavigation";
import TripOverview from "@/components/trips/TripOverview";
import TripItinerary from "@/components/trips/TripItinerary";
import TripLocations from "@/components/trips/TripLocations";
import { TripDetails } from "@/types/trip.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Globe2, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type TripDetailsClientProps = {
  tripId: string;
  initialData: TripDetails;
};

export default function TripDetailsClient({ tripId, initialData }: TripDetailsClientProps) {
  const overviewRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeSection, setActiveSection] = useState("Overview");
  const router = useRouter();
  const session = useSession();

  const scrollIntoView = (scrollTo: string) => {
    const refMap = {
      Overview: overviewRef,
      Itinerary: itineraryRef,
      Locations: locationsRef,
    } as const;
    
    const ref = refMap[scrollTo as keyof typeof refMap];
    if (ref?.current) {
      ref.current.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const placesIds = useMemo(() => 
    initialData.itinerary.dailyTrip.reduce((ids: string[], day) => {
      day.itinerary.forEach(itinerary => {
        itinerary.activities.forEach(activity => {
          if (activity.place_id) {
            ids.push(activity.place_id);
          }
        });
      });
      return ids;
    }, []),
    [initialData.itinerary.dailyTrip]
  );

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const response = await fetch(`/api/trips/${tripId}/publish`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to publish trip');
      }

      toast.success('Trip published successfully!');
      setShowPublishDialog(false);
    } catch (error) {
      toast.error('Failed to publish trip');
      console.error('Error publishing trip:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const isPublishable = useMemo(() => {
    return (
      initialData.title &&
      initialData.location &&
      initialData.itinerary.dailyTrip.some(day => 
        day.itinerary.some(it => it.activities.length > 0)
      )
    );
  }, [initialData]);

  useEffect(() => {
    let lastKnownScrollPosition = 0;
    let ticking = false;

    const updateActiveSection = (scrollPos: number) => {
      const offset = 112; // Header heights
      const overviewTop = overviewRef.current?.getBoundingClientRect().top ?? 0;
      const itineraryTop = itineraryRef.current?.getBoundingClientRect().top ?? 0;
      const locationsTop = locationsRef.current?.getBoundingClientRect().top ?? 0;

      if (locationsTop <= offset) {
        setActiveSection("Locations");
      } else if (itineraryTop <= offset) {
        setActiveSection("Itinerary");
      } else if (overviewTop <= offset) {
        setActiveSection("Overview");
      }
    };

    const onScroll = () => {
      lastKnownScrollPosition = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection(lastKnownScrollPosition);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] px-container pt-16">
      <div className="relative w-full mb-6">
        <TripBanner
          coverImage={initialData.coverPhoto}
          title={initialData.title}
          location={initialData.location}
          username={initialData.username}
          duration={initialData.duration}
          isOwner={session.data?.user.username === initialData.username}
        />
        <div className="absolute top-4 right-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    onClick={() => setShowPublishDialog(true)}
                    disabled={!isPublishable}
                    className={cn(
                      "w-[160px] px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md",
                      "flex items-center gap-2",
                      isPublishable 
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    {isPublishing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Globe2 className="w-4 h-4" />
                    )}
                    {isPublishing ? 'Publishing...' : 'Publish Trip'}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {!isPublishable && (
                  <p>Please add a title, location and at least one activity to publish your trip</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish this trip? Published trips will be visible to all users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto w-full max-w-5xl min-h-[120dvh]">
        <TripNavigation onNavigate={scrollIntoView} activeSection={activeSection} />
        
        <div ref={overviewRef}>
          <TripOverview overview={initialData.overview} />
        </div>

        <div ref={itineraryRef}>
          <TripItinerary itinerary={initialData.itinerary} />
        </div>

        <div ref={locationsRef}>
          <TripLocations  placesIds ={placesIds}/>
        </div>
      </div>
    </div>
  );
}
