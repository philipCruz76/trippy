"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import {
  TripCreatorState,
  useTripCreatorStore,
} from "@/lib/stores/create-trip-store";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";
import { Destinations } from "@/types/prisma.types";
import getDestinationData from "@/lib/actions/getDestinationData";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";

// Form validation schema
const tripFormSchema = z.object({
  title: z.string().min(3, "Title is required"),
  location: z
    .string()
    .refine((value) => value.trim() !== "", "Location is required"),
  duration: z.number().min(1, "Duration is required"),
});

type TripFormValues = Omit<TripCreatorState, "itinerary">;

const TrIpCreationWizard = () => {
  const { showWizard, setShowWizard, setShowEditor } = useTripEditorStore();
  const { setTitle, setLocation, setDuration } = useTripCreatorStore();
  const [step, setStep] = useState(1);
  const [destinationResults, setDestinationResults] = useState<Destinations>();
  const [filteredResults, setFilteredResults] = useState<Destinations>();

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: "",
      location: "",
      duration: 0,
    },
  });

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
    watch,
  } = form;

  // Search destinations with debounce
  const searchResults = useDebouncedCallback(async (query: string) => {
    if (destinationResults !== undefined) {
      const result = destinationResults.filter((destination) =>
        destination.city!.toLowerCase().startsWith(query.toLowerCase()),
      );
      setFilteredResults(result);
    }
  }, 500);

  // Load destination data
  useEffect(() => {
    const loadDestinationData = async () => {
      const data = await getDestinationData();
      setDestinationResults(data);
    };
    loadDestinationData();
  }, []);

  // Generate duration options
  const durationOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleNext = async () => {
    if (step === 1) {
      const titleValid = await form.trigger("title");
      if (!titleValid) return;
    } else if (step === 2) {
      const locationValue = getValues("location");
      if (
        destinationResults?.some(
          (dest) => dest.city?.toLowerCase() === locationValue.toLowerCase(),
        )
      ) {
        setValue("location", locationValue);
      } else {
        form.setError("location", {
          message: "Please select a valid destination from the list",
        });
        return;
      }
      const locationValid = await form.trigger("location");
      if (!locationValid) return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = (data: TripFormValues) => {
    // Initialize trip data in both stores
    setTitle(data.title);
    setLocation(data.location);
    setDuration(data.duration);

    // Close wizard and open editor
    setShowWizard(false);
    setShowEditor(true);
  };

  return (
    <Dialog open={showWizard} onOpenChange={(open) => setShowWizard(open)}>
      <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
      <DialogContent className="max-w-[500px] p-6 flex flex-col justify-between rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === 1
              ? "Name your trip"
              : step === 2
                ? "Choose destination"
                : "Set duration"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {step === 1 && (
            <div className="space-y-4">
              <Label htmlFor="title">Trip Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter trip title..."
                className="w-full"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label htmlFor="location">Destination</Label>
              <Input
                id="location"
                {...register("location")}
                onChange={(e) => {
                  setValue("location", e.target.value);
                  if (e.target.value !== "") searchResults(e.target.value);
                }}
                placeholder="Search destination..."
                className="w-full"
              />
              {errors.location && (
                <p className="text-red-500 text-sm">
                  {errors.location.message}
                </p>
              )}
              {Array.isArray(filteredResults) && filteredResults.length > 0 ? (
                <div className="relative mt-9 flex flex-col max-h-[220px] overflow-y-scroll gap-4">
                  {filteredResults.map((destination) => (
                    <div
                      onClick={() => {
                        setValue("location", destination.city!);
                      }}
                      className="flex flex-row justify-start cursor-pointer items-center gap-2 hover:bg-gray-200 rounded-xl p-2"
                    >
                      <Image
                        src={destination.photo!}
                        alt={destination.city!}
                        width={64}
                        height={64}
                        className="rounded-2xl overflow-hidden min-h-[64px] min-w-[64px] max-h-[64px] max-w-[64px]"
                      />
                      <div className="min-w-0 flex-1 flex flex-col leading-tight">
                        <span className="mb-0.5 truncate text-md font-semibold">
                          {destination.city}
                        </span>
                        <span className="capitalize">
                          {destination.country}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={watch("duration")?.toString()}
                onValueChange={(value) =>
                  setValue("duration", parseInt(value, 10))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-red-500 text-sm">
                  {errors.duration.message}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button type="button" onClick={handleBack} variant="outline">
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className={`ml-auto ${
                  (step === 1 && !watch("title")) ||
                  (step === 2 && !watch("location"))
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  (step === 1 && !watch("title")) ||
                  (step === 2 && !watch("location"))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className={`ml-auto ${
                  !watch("duration")
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : ""
                }`}
                disabled={!watch("duration")}
              >
                Submit
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TrIpCreationWizard;
