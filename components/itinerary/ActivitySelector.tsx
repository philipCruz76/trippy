"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/DatePicker";
import { minutesToTimeString, timeStringToMinutes } from "@/lib/utils";
import { ActivityValidator, ActivityType } from "@/types/trip.types";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";

type ActivitySelectorProps = {
  editField: boolean;
  dayIndex:number;
  setEditField: Dispatch<SetStateAction<{create:boolean,dayIndex:number}>>;
};
type TimeRange = {
  from: string;
  to: string;
};
/**
 * ActivitySelector component for adding and editing trip activities
 * Handles form validation and activity management
 */
const ActivitySelector = ({
  editField,
  dayIndex,
  setEditField,
}: ActivitySelectorProps) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addActivity } = useTripEditorStore();

  const form = useForm<ActivityType["dailyActivities"][0]>({
    resolver: zodResolver(ActivityValidator),
    defaultValues: {
      title: "",
      cover: "",
      manualInput: true,
      activityType: "",
      durationFrom: "",
      durationTo: "", 
    },
    mode: "onChange",
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const ACTIVITY_TYPES = [
    { value: "/icons/activity.svg", label: "Activity" },
    { value: "/icons/hike.svg", label: "Experience" },
    { value: "/icons/star.svg", label: "Attraction" },
    { value: "/icons/food.svg", label: "Restaurant" },
    { value: "/icons/hotel.svg", label: "Hotel" },
    { value: "/icons/cafe.svg", label: "Cafe" },
    { value: "/icons/marker.svg", label: "Custom" },
  ] as const;

  const DURATION_OPTIONS = [
    { value: "30", label: "30 min" },
    { value: "60", label: "1h" },
    { value: "90", label: "1h 30 min" },
    { value: "120", label: "2h" },
    { value: "150", label: "2h 30min" },
    { value: "180", label: "3h" },
  ] as const;

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Add file validation
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("cover", reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
      console.error('Image upload error:', err);
    }
  };

  const onSubmit = async (data: ActivityType["dailyActivities"][0]) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newActivity = {
        id: data.id,
        activityType: data.activityType,
        title: data.title,
        manualInput: true,
        durationFrom: data.durationFrom,
        durationTo: data.durationTo,
        cover: data.cover,
      };

      addActivity(newActivity, dayIndex);
      setEditField({ create: false, dayIndex: 0 });
      form.reset();
    } catch (err) {
      setError('Failed to add activity. Please try again.');
      console.error('Failed to add activity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add confirmation dialog for unsaved changes
  const handleDialogClose = () => {
    if (form.formState.isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    setEditField({ create: false, dayIndex: 0 });
    form.reset();
    setError(null);
  };
  
  useEffect(() => {
    return () => {
      form.reset();
      setShowForm(false);
      setError(null);
    };
  }, [form]);

  return (
    <Dialog
      open={editField}
      modal
      onOpenChange={(open) => {
        if (!open && form.formState.isDirty) {
          // Add confirmation before closing
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            setEditField({create: false, dayIndex: 0});
          }
          return;
        }
        setEditField({create: false, dayIndex: 0});
      }}
    >
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogContent>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new activity to your trip.
          </DialogDescription>
          <div className="flex flex-col w-full h-full gap-4">
            <h3 className="font-sans font-semibold"> What are you planning?</h3>
            <Select
              onValueChange={(value) => {
                setValue("activityType", value);
                setShowForm(true);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/icons/activity.svg">
                  <div className="flex flex-row gap-3">
                    <Image
                      src="/icons/activity.svg"
                      alt="Activity icon"
                      width={24}
                      height={24}
                    />
                    <span className="font-sans font-normal">Activity</span>
                  </div>
                </SelectItem>
                <SelectItem value="/icons/hike.svg">
                  <div className="flex flex-row gap-3">
                    <Image
                      src="/icons/hike.svg"
                      alt="Experience icon"
                      width={24}
                      height={24}
                    />
                    <span className="font-sans font-normal">Experience</span>
                  </div>
                </SelectItem>
                <SelectItem value="/icons/star.svg">
                  <div className="flex flex-row gap-3">
                    <Image
                      src="/icons/star.svg"
                      alt="Attraction icon"
                      width={24}
                      height={24}
                    />
                    <span className="font-sans font-normal">Attraction</span>
                  </div>
                </SelectItem>
                <SelectItem value="/icons/food.svg">
                  <div className="flex flex-row gap-3">
                    <Image
                      src="/icons/food.svg"
                      alt="Restaurant icon"
                      width={24}
                      height={24}
                    />
                    <span className="font-sans font-normal">Restaurant</span>
                  </div>
                </SelectItem>
                <SelectItem value="/icons/hotel.svg">
                  <div className="flex flex-row gap-3">
                    <Image
                      src="/icons/hotel.svg"
                      alt="Hotel icon"
                      width={24}
                      height={24}
                    />
                    <span className="font-sans font-normal">Hotel</span>
                  </div>
                </SelectItem>
                <SelectItem value="/icons/cafe.svg">
                  <div className="flex flex-row gap-3">
                    <Image
                      src="/icons/cafe.svg"
                      alt="cafe icon"
                      width={24}
                      height={24}
                    />
                    <span className="font-sans font-normal">Cafe</span>
                  </div>
                </SelectItem>
                <SelectItem value="/icons/marker.svg">
                  <div className="flex flex-row gap-3">
                    <Image
                      src="/icons/marker.svg"
                      alt="Custom icon"
                      width={24}
                      height={24}
                    />
                    <span className="font-sans font-normal">Custom</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {showForm && (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col w-full max-h-[300px] overflow-x-hidden overflow-y-scroll gap-2"
              >
                <Label htmlFor="title" className="font-semibold">
                  Name
                </Label>
                <Input
                  {...register("title")}
                  className="flex w-full text-black transition-colors truncate placeholder:text-muted focus:outline-none focus-visible:border-black focus:placeholder:text-gray-8 text-sm px-3 py-2 h-[32px] rounded-full bg-white border data-[invalid]:border-red-500"
                />
                {errors.title && (
                  <span className="text-red-500 text-xs">{errors.title.message}</span>
                )}

                <div className="grid grid-cols-3 grid-rows-1">
                  <div className="col-span-1 row-span-1 w-full px-[4px]">
                    <Label htmlFor="date" className="font-semibold">
                      Date
                    </Label>
                    {/** !! TO-DO: !!!
                     *  Need to be able to assign activity to specific date within gthe trip time-frame
                     */}
                    <DatePicker
                      id="date"
                      singleMode
                      className="text-black transition-colors truncate placeholder:text-muted focus:outline-none focus-visible:border-black focus:placeholder:text-gray-8 text-sm px-3 py-2 h-[32px] rounded-full bg-white border data-[invalid]:border-red-500"
                    />
                  </div>
                  <div className="col-span-1 row-span-1 w-full px-[4px]">
                    <Label htmlFor="time" className="font-semibold">
                      Time
                    </Label>
                    <Input
                      {...register("durationFrom")}
                      placeholder="12:00"
                      className="w-full text-black transition-colors truncate placeholder:text-opacity-30 focus:outline-none focus-visible:border-black focus:placeholder:text-gray-300 text-sm px-3 py-2 h-[32px] rounded-full bg-white border data-[invalid]:border-red-500"
                    />
                    {errors.durationFrom && (
                      <span className="text-red-500 text-xs">{errors.durationFrom.message}</span>
                    )}
                  </div>
                  <div className="col-span-1 row-span-1 w-full px-[4px]">
                    <Label htmlFor="duration" className="font-semibold">
                      Duration
                    </Label>
                    <Select onValueChange={(value) => setValue("durationTo", value)}>
                      <SelectTrigger
                        className="w-full text-black transition-colors truncate placeholder:text-muted focus:outline-none focus-visible:border-black focus:placeholder:text-gray-8 text-sm px-3 py-2 h-[32px] rounded-full bg-white border data-[invalid]:border-red-500"
                      >
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1h</SelectItem>
                        <SelectItem value="90">1h 30 min</SelectItem>
                        <SelectItem value="120">2h</SelectItem>
                        <SelectItem value="150">2h 30min</SelectItem>
                        <SelectItem value="180">3h</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.durationTo && (
                      <span className="text-red-500 text-xs">{errors.durationTo.message}</span>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="cover" className="font-semibold">
                    Cover Image
                  </Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-gray-100">
                      {watch("cover") ? (
                        <Image
                          src={watch("cover") || ""}
                          alt="Activity cover"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer rounded-full bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200">
                      Choose Image
                      <input
                        type="file"
                        id="cover"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                  </div>
                </div>
                <div className="sticky bottom-0 mt-auto flex justify-end border-t border-separator bg-background py-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !form.formState.isValid}
                    className={`group group/button relative z-0 border border-transparent inline-flex justify-center items-center rounded-full font-medium outline-none gap-[.3em] disabled:pointer-events-none transition-colors text-center p-2 px-3 text-balance text-white text-xs min-h-[--button-sm-size] leading-[1.125] ${
                      form.formState.isValid 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-zinc-400 opacity-50'
                    }`}
                  >
                    <span>{isSubmitting ? 'Adding...' : 'Add'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default ActivitySelector;
