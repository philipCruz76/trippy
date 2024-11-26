"use client";

import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/DatePicker";
import DestinationSelector from "./DestinationSelector";
import ActivitySelector from "./ActivitySelector";
import Activity from "./Activity";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ActivityType } from "@/types/trip.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const MemoizedActivity = memo(Activity);
/**
 * TripPlanner component for managing trip details and activities
 * Handles trip creation, editing, and activity management
 */
const TripPlanner = () => {
  // State management
  // Trip state management hooks
  const {
    title,
    duration,
    location,
    itinerary,
    setTitle,
    setItinerary,
    setLocation,
    setDuration,
  } = useTripCreatorStore();
  const [open, setIsOpen] = useState<boolean>(false);
  const [editLocation, setEditLocation] = useState<boolean>(false);
  const [createActivity, setCreateActivity] = useState({
    create: false,
    dayIndex: 0,
  });
  const [dayToDelete, setDayToDelete] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), duration - 1),
  });
  const [isSaving, setIsSaving] = useState(false);

  const { tripActivities, setTripActivities, moveActivity } =
    useTripEditorStore();

  const router = useRouter();

  /**
   * Syncs itinerary activities with trip activities when itinerary changes
   */
  useEffect(() => {
    // Guards against undefined/null values
    if (!itinerary?.days || itinerary.days.length !== duration) {
      // Initialize empty arrays for each day
      const emptyDays = Array.from({ length: duration }, () => ({
        title: "",
        dailyActivities: [],
      }));
      setItinerary({ days: emptyDays });
      return;
    }

    // Check if activities are actually different before updating
    const newActivities = itinerary.days.map((day) => day.dailyActivities);
    setTripActivities(newActivities);
  }, [itinerary, duration]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceDay = parseInt(result.source.droppableId.split("-")[1]);
    const destinationDay = parseInt(
      result.destination.droppableId.split("-")[1],
    );

    moveActivity(
      sourceDay,
      destinationDay,
      result.source.index,
      result.destination.index,
    );
  };

  const handleDateChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleAddDay = () => {
    if (!itinerary?.days) {
      setItinerary({
        days: [{ dailyActivities: [] }],
      });
      setDuration(1);
      return;
    }

    // Create new itinerary with preserved data
    const newItinerary = {
      days: [
        ...itinerary.days,
        { dailyActivities: [] }, // Add new empty day
      ],
    };

    setItinerary(newItinerary);
    setDuration(duration + 1);

    if (dateRange.from) {
      setDateRange({
        from: dateRange.from,
        to: addDays(dateRange.from, duration),
      });
    }
  };

  const handleRemoveDay = (dayIndex: number) => {
    if (duration <= 1 || !itinerary || !itinerary.days) return;

    // Create new itinerary without the removed day but preserve other days
    const newItinerary = {
      days: itinerary.days.filter((_, index) => index !== dayIndex),
    };

    setItinerary(newItinerary);
    setDuration(duration - 1);

    if (dateRange.from) {
      setDateRange({
        from: dateRange.from,
        to: addDays(dateRange.from, duration - 2),
      });
    }

    setDayToDelete(null);
  };

  const handleSaveTrip = async () => {
    // Prevent multiple clicks while validation is happening
    if (isSaving) return;

    // Check if there are days and at least one activity
    if (!itinerary?.days || itinerary.days.length === 0) {
      toast.error("Please add at least one day to your trip");
      return;
    }

    const hasActivities = itinerary.days.some(
      (day) => day.dailyActivities && day.dailyActivities.length > 0,
    );

    if (!hasActivities) {
      toast.error("Please add at least one activity to your trip");
      return;
    }

    setIsSaving(true); // Start loading

    try {
      const { title, location, duration, itinerary, overview } =
        useTripCreatorStore.getState();

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          location,
          duration,
          itinerary,
          overview, // Pass the overview directly from the store
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save trip");
      }

      const savedTrip = await response.json();

      // Reset both stores
      useTripCreatorStore.getState().resetStore();
      useTripEditorStore.getState().resetStore();

      toast.success("Trip saved successfully!");
      toast.success("Redirecting to trip...");
      router.push(`/explore/${savedTrip.id}`);
    } catch (error) {
      toast.error("Failed to save trip. Please try again.");
      setIsSaving(false); // Only reset if there's an error
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="w-full">
          {/* Trip Title */}
          <div className="relative group pb-4 pt-6 flex flex-row gap-2 min-w-full items-center">
            <Input
              type="text"
              id="trip-title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              placeholder="Insert Trip Tile"
              className="text-2xl truncate font-semibold border-none border-0 min-w-full focus:ring-0 z-2"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="#797979"
              viewBox="0 0 256 256"
              className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-300 fill-black"
            >
              <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H216a8,8,0,0,0,0-16H115.32l112-112A16,16,0,0,0,227.32,73.37ZM136,75.31,152.69,92,68,176.69,51.31,160ZM48,208V179.31L76.69,208Zm48-3.31L79.32,188,164,103.31,180.69,120Zm96-96L147.32,64l24-24L216,84.69Z"></path>
            </svg>
          </div>
          {/*Trip Details */}
          <div className="flex divide-x divide-gray-300 rounded-full border border-separator py-1 text-xs font-medium text-muted dark:divide-white w-fit">
            {/* Location */}
            <div className="min-w-0">
              <button
                onClick={() => setEditLocation(true)}
                className="relative z-1 -my-1 flex h-[32px] items-center rounded-l-full pl-4 pr-3 transition-colors hover:bg-foreground/5 hover:text-foreground text-foreground"
              >
                <span className="truncate text-foreground text-sm">
                  {location === "" ? "Location" : location}{" "}
                </span>
              </button>
            </div>
            <DatePicker
              className="relative flex z-1 -mx-px -my-1 h-[32px] px-3 rounded-r-full transition-colors hover:bg-foreground/5 hover:text-foreground text-foreground"
              onDateChange={handleDateChange}
            />
          </div>
        </div>
        <div className="flex justify-end mb-4">
          {/** TODO: Implement save trip functionality */}
          <Button
            onClick={handleSaveTrip}
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Trip
              </>
            )}
          </Button>
        </div>
        {/* Itinerary */}
        <div className="w-full h-full overflow-y-scroll">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold text-xl">
              Itinerary{" "}
              <span className="text-gray-400 font-light text-sm">
                {" "}
                {isNaN(itinerary?.days?.length!)
                  ? 1
                  : itinerary?.days?.length}{" "}
                days
              </span>
            </h2>
            <button
              onClick={handleAddDay}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1 rounded-full border hover:bg-zinc-200 transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-blue-500 text-lg group-hover:scale-125 transform ease-in-out duration-300">
                +
              </span>
              <span className="text-blue-500 group-hover:font-semibold transform ease-in-out duration-300">
                Add day
              </span>
            </button>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Accordion type="multiple" defaultValue={["day-1"]}>
              {Array.from({ length: duration }, (_, index) => (
                <AccordionItem
                  key={`day-${index + 1}`}
                  value={`day-${index + 1}`}
                  className="border-none"
                >
                  <div className="flex items-center justify-between">
                    <AccordionTrigger
                      className="flex w-full items-center justify-start"
                      onClick={() => setIsOpen((prev) => !prev)}
                    >
                      <h3>Day {index + 1}</h3>
                    </AccordionTrigger>

                    {duration > 1 && (
                      <Dialog open={dayToDelete === index}>
                        <DialogTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDayToDelete(index);
                            }}
                            disabled={isSaving}
                            className="mr-4 p-1.5 rounded-full hover:bg-red-100 group transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="#EF4444"
                              viewBox="0 0 32 32"
                              id="trash-bin"
                              className="group-hover:scale-110 transition-transform duration-300"
                            >
                              <path
                                fill="#EF4444"
                                d="M13 17C13 16.4477 12.5523 16 12 16 11.4477 16 11 16.4477 11 17V23C11 23.5523 11.4477 24 12 24 12.5523 24 13 23.5523 13 23V17zM16 16C16.5523 16 17 16.4477 17 17V23C17 23.5523 16.5523 24 16 24 15.4477 24 15 23.5523 15 23V17C15 16.4477 15.4477 16 16 16zM21 17C21 16.4477 20.5523 16 20 16 19.4477 16 19 16.4477 19 17V23C19 23.5523 19.4477 24 20 24 20.5523 24 21 23.5523 21 23V17z"
                              ></path>
                              <path
                                fill="#EF4444"
                                fill-rule="evenodd"
                                d="M14 2C13.4477 2 13 2.44772 13 3V5H7.00001C6.54114 5 6.14116 5.3123 6.02987 5.75746L5.02987 9.75746C4.95518 10.0562 5.0223 10.3727 5.2118 10.6154C5.40131 10.8581 5.69207 11 6.00001 11H7V29C7 29.5523 7.44772 30 8 30H24C24.5523 30 25 29.5523 25 29V11H26C26.3079 11 26.5987 10.8581 26.7882 10.6154C26.9777 10.3727 27.0448 10.0562 26.9702 9.75746L25.9702 5.75746C25.8589 5.3123 25.4589 5 25 5H19V3C19 2.44772 18.5523 2 18 2H14ZM17 5H15V4H17V5ZM9 28V11H23V28H9ZM24.2192 7L24.7192 9H7.28079L7.78079 7H24.2192Z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove Day {index + 1}</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove Day {index + 1}?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setDayToDelete(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleRemoveDay(index)}
                            >
                              Remove
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <AccordionContent className="flex flex-col gap-1 overflow-y-scroll max-h-[350px]">
                    <Droppable droppableId={`day-${index}`}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex flex-col gap-1"
                        >
                          {tripActivities?.[index]?.map(
                            (activity: ActivityType, actIdx: number) => (
                              <Draggable
                                key={`activity-${index}-${actIdx}`}
                                draggableId={`activity-${index}-${actIdx}`}
                                index={actIdx}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      "transition-shadow",
                                      snapshot.isDragging && "shadow-lg",
                                    )}
                                  >
                                    <MemoizedActivity
                                      id={activity.id}
                                      activityType={activity.activityType}
                                      cover={activity.cover}
                                      durationFrom={activity.durationFrom}
                                      durationTo={activity.durationTo}
                                      title={activity.title}
                                      location={activity.location}
                                      manualInput={activity.manualInput}
                                      dayIdx={index}
                                      actIdx={actIdx}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ),
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    <button
                      onClick={() =>
                        setCreateActivity({ create: true, dayIndex: index })
                      }
                      disabled={isSaving}
                      className="w-[90px] text-center items-center justify-center flex rounded-full border p-1 hover:bg-zinc-200 hover:animate-pulse group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-blue-500 text-xl group-hover:scale-125 transform ease-in-out duration-300">
                        +
                      </span>
                      <span className="hover:font-semibold transform ease-in-out duration-300">
                        Add item
                      </span>
                    </button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </DragDropContext>
        </div>
      </form>
      {editLocation ? (
        <DestinationSelector
          editField={editLocation}
          setEditField={setEditLocation}
          setLocation={setLocation}
        />
      ) : null}
      {createActivity.create ? (
        <ActivitySelector
          editField={createActivity.create}
          dayIndex={createActivity.dayIndex}
          setEditField={setCreateActivity}
        />
      ) : null}
    </div>
  );
};

export default TripPlanner;
