"use client";

import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/DatePicker";
import DestinationSelector from "./DestinationSelector";
import ActivitySelector from "./ActivitySelector";
import Activity from "./Activity";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ActivityType } from "@/types/trip.types";

/**
 * TripPlanner component for managing trip details and activities
 * Handles trip creation, editing, and activity management
 */
const TripPlanner = () => {
  // State management
  const [open, setIsOpen] = useState<boolean>(false);
  const [editLocation, setEditLocation] = useState<boolean>(false);
  const [createActivity, setCreateActivity] = useState({create: false, dayIndex: 0});

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
    setComment,
    addActivity,
    removeActivity,
  } = useTripCreatorStore();
  
  const { tripActivities, setTripActivities,moveActivity } = useTripEditorStore();

  /**
   * Syncs itinerary activities with trip activities when itinerary changes
   */
  useEffect(() => {
    // Guards against undefined/null values
    if (!itinerary?.days || itinerary.days.length !== duration) {
      return;
    }

    // Check if activities are actually different before updating
    const newActivities = itinerary.days.map((day) => day.dailyActivities);
    setTripActivities(newActivities);
  }, [itinerary, duration]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceDay = parseInt(result.source.droppableId.split('-')[1]);
    const destinationDay = parseInt(result.destination.droppableId.split('-')[1]);
    
    moveActivity(
      sourceDay,
      destinationDay,
      result.source.index,
      result.destination.index
    );
  };

  return (
  
      <div className="flex flex-col h-full overflow-hidden">
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full overflow-hidden">
        <div className="w-full">
          {/* Trip Title */}
          <div className="relative group pb-4 pt-6 flex flex-row gap-2 min-w-full items-center">
            <Input
              type="text"
              id="trip-title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              placeholder="Insert Trip Tile"
              className="text-4xl truncate font-semibold border-none border-0 min-w-full focus:ring-0 z-2"
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
            <DatePicker className="relative flex z-1 -mx-px -my-1 h-[32px] px-3 rounded-r-full transition-colors hover:bg-foreground/5 hover:text-foreground text-foreground" />
          </div>
        </div>
        {/* Itinerary */}
        <div className="w-full h-full overflow-y-scroll">
          <h2 className="font-semibold text-xl">
            Itinerary{" "}
            <span className="text-gray-400 font-light text-sm">
              {" "}
              {isNaN(itinerary?.days?.length!) ? 1 : itinerary?.days?.length} days
            </span>
          </h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Accordion type="multiple" defaultValue={["day-1"]}>
              {Array.from(new Array(Math.max(1, itinerary?.days?.length || 1))).map((_, index) => (
                <AccordionItem
                  key={`day-${index + 1}`}
                  value={`day-${index + 1}`}
                  className="border-none"
                >
                  <AccordionTrigger
                    className="flex w-full items-center justify-start"
                    onClick={() => setIsOpen((prev) => !prev)}
                  >
                    <h3>Day {index + 1}</h3>
                  
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-1 overflow-y-scroll max-h-[350px]">
                    <Droppable droppableId={`day-${index}`}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex flex-col gap-1"
                        >
                          {tripActivities?.[index]?.map((activity: ActivityType, actIdx: number) => (
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
                                    snapshot.isDragging && "shadow-lg"
                                  )}
                                >
                                  <Activity
                                  id={activity.id}
                                    activityType={activity.activityType}
                                    cover={activity.cover}
                                    durationFrom={activity.durationFrom}
                                    durationTo={activity.durationTo}
                                    title={activity.title}
                                    manualInput={activity.manualInput}
                                    dayIdx={index}
                                    actIdx={actIdx}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    <button
                      onClick={() => setCreateActivity({create: true, dayIndex: index})}
                      className="w-[90px] text-center items-center justify-center flex rounded-full border p-1 hover:bg-zinc-200 hover:animate-pulse group"
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
