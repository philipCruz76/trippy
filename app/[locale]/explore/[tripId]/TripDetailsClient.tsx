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
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
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


  const handlePublish = async () => {
    try {
      // Get latest values from tripEditorStore
      const { 
        title: updatedTitle, 
        coverPhoto: updatedCoverPhoto,
        coverPhotoCreditName,
        coverPhotoCreditLink,
        tripActivities 
      } = useTripEditorStore.getState();

      // Check if there are any changes
      const hasChanges = 
        (updatedTitle && updatedTitle !== initialData.title) ||
        (updatedCoverPhoto && updatedCoverPhoto !== initialData.coverPhoto) ||
        (coverPhotoCreditName && coverPhotoCreditName !== initialData.photoCreditName) ||
        (coverPhotoCreditLink && coverPhotoCreditLink !== initialData.photoCreditLink) ||
        tripActivities.some((dayActivities, dayIndex) =>
          dayActivities.some((activity, actIndex) => {
            const originalActivity = initialData.itinerary.dailyTrip[dayIndex]?.itinerary[0]?.activities[actIndex];
            return activity.summary !== (originalActivity?.summary || '');
          })
        );

      if (!hasChanges) {
        toast.success('No changes to publish');
        setShowPublishDialog(false);
        return;
      }

      setIsPublishing(true);
      
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
          activities: tripActivities.map(dayActivities => 
            dayActivities.map(activity => ({
              ...activity,
              summary: activity.summary || ''
            }))
          )
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

  const handleUnpublish = async () => {
    try {
      setIsPublishing(true);
      
      const response = await fetch(`/api/trips/${tripId}/publish`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish trip');
      }

      toast.success('Trip unpublished successfully!');
      setShowUnpublishDialog(false);
    } catch (error) {
      toast.error('Failed to unpublish trip');
      console.error('Error unpublishing trip:', error);
    } finally {
      setIsPublishing(false);
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

  const extractPOILocations = (initialData: TripDetails) => {
    // Extract all activities from all days and flatten them into a single array
    const POIs = initialData.itinerary.dailyTrip
      .map(day => 
        day.itinerary.flatMap(item => 
          item.activities.map(activity => ({
            location: {
              lat: activity.location.lat,
              lng: activity.location.lng,
            },
            summary: activity.summary,
            photos: activity.photos,
            place_id: activity.place_id,
            activityName: activity.activityName,
            formatted_address: activity.formatted_address,
            activityType: activity.activityType || '',
            time: activity.time || '',
          }))
        )
      )
      .flat();

    return POIs;
  };

  const placesLocations = extractPOILocations(initialData);

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
      </div>

      {session.data?.user.username === initialData.username && (
        <div className="fixed top-[120px] right-[32px] flex flex-col gap-2 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setShowPublishDialog(true)}
                  disabled={!isPublishable}
                  className={cn(
                    "group relative z-0 inline-flex justify-center items-center gap-2",
                    "rounded-full font-medium outline-none transition-all duration-200",
                    "py-[.25em] px-6 min-h-[40px] text-sm",
                    !isPublishable
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-white text-gray-800 border border-input hover:border-black hover:scale-105 active:scale-100",
                    "shadow-sm backdrop-blur-sm"
                  )}
                >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe2 className="w-4 h-4" />
                  )}
                  {isPublishing ? 'Publishing...' : 'Publish Trip'}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {!isPublishable ? (
                  <p>Please add a title, location and at least one activity to publish your trip</p>
                ) : initialData.published ? (
                  <p>Update and Publish Trip with new details</p>
                ) : (
                  <p>Make your trip visible to other users</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {initialData.published === true && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setShowUnpublishDialog(true)}
                    className={cn(
                      "group relative z-0 inline-flex justify-center items-center gap-2",
                      "rounded-full font-medium outline-none transition-all duration-200",
                      "py-[.25em] px-6 min-h-[40px] text-sm",
                      "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100",
                      "shadow-sm backdrop-blur-sm"
                    )}
                  >
                    {isPublishing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Globe2 className="w-4 h-4" />
                    )}
                    {isPublishing ? 'Processing...' : 'Unpublish Trip'}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Make your trip private</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setShowDeleteDialog(true)}
                  variant="ghost"
                  className={cn(
                    "h-10 w-10 rounded-full bg-white shadow-sm",
                    "hover:bg-destructive hover:text-white transition-all duration-200",
                    "hover:scale-105 active:scale-100"
                  )}
                >
                  <Trash2 className="min-w-5 min-h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Delete trip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

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

      <Dialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <DialogContent className="mobile:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Unpublish Trip</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to unpublish this trip? It will no longer be visible to other users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowUnpublishDialog(false)}
              disabled={isPublishing}
              className="flex-1 rounded-full h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnpublish}
              disabled={isPublishing}
              className="flex-1 rounded-full h-10 bg-primary hover:bg-primary/90"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unpublishing...
                </>
              ) : (
                <>
                  <Globe2 className="w-4 h-4 mr-2" />
                  Unpublish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto w-full max-w-5xl min-h-[120dvh]">
        <TripNavigation onNavigate={scrollIntoView} activeSection={activeSection} />
        
        <div ref={overviewRef}>
          <TripOverview overview={initialData.overview} isOwner={session.data?.user.username === initialData.username} />
        </div>

        <div ref={itineraryRef}>
          <TripItinerary itinerary={initialData.itinerary} isOwner={session.data?.user.username === initialData.username} />
        </div>

        <div ref={locationsRef}>
          <TripLocations POIs={placesLocations} />
        </div>
      </div>
    </div>
  );
}
