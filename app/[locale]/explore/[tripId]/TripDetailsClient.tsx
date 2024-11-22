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
import { Globe2, Loader2, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      
      // Get latest values from tripEditorStore
      const { 
        title: updatedTitle, 
        coverPhoto: updatedCoverPhoto,
        coverPhotoCreditName,
        coverPhotoCreditLink 
      } = useTripEditorStore.getState();
      
      const response = await fetch(`/api/trips/${tripId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedTitle || initialData.title,
          coverPhoto: updatedCoverPhoto || initialData.coverPhoto,
          photoCreditName: coverPhotoCreditName || initialData.photoCreditName,
          photoCreditLink: coverPhotoCreditLink || initialData.photoCreditLink,
        }),
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }

      toast.success('Trip deleted successfully!');
      router.push('/explore'); // Redirect to explore page after deletion
    } catch (error) {
      toast.error('Failed to delete trip');
      console.error('Error deleting trip:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {session.data?.user.username === initialData.username && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setShowPublishDialog(true)}
                      disabled={!isPublishable}
                      className={cn(
                        "h-10 px-6 text-sm font-medium rounded-full transition-all duration-200",
                        "flex items-center gap-2",
                        isPublishable 
                          ? "bg-white hover:bg-primary text-foreground hover:text-white border border-input"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      )}
                    >
                      {isPublishing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Globe2 className="w-4 h-4" />
                      )}
                      {isPublishing ? 'Publishing...' : 'Publish Trip'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!isPublishable ? (
                      <p>Please add a title, location and at least one activity to publish your trip</p>
                    ) : (
                      <p>Make your trip visible to other users</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setShowDeleteDialog(true)}
                      variant="ghost"
                      className="h-10 w-10 rounded-full bg-white hover:bg-destructive hover:text-white transition-colors"
                    >
                      <Trash2 className="min-w-5 min-h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete trip</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="mobile:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Publish Trip</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to publish this trip? Published trips will be visible to all users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
              disabled={isPublishing}
              className="flex-1 rounded-full h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1 rounded-full h-10 bg-primary hover:bg-primary/90"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe2 className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="mobile:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Trip</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to delete this trip? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Delete
                </>
              )}
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
