import { z } from "zod";

export type ItineraryDestination = {
  id: string;
  name: string;
  coverPhoto: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  openingHours?: string[];
};

export type GPTDestinationInput = {
  index: number;
  name: string;
  description: string;
};
export type GPTItineraryStructure = {
  location: string;
  activities: GPTDestinationInput[];
  duration: number;
};



export const ActivityValidator = z.object({
  id: z.string(),
  title: z.string().min(3, "Title is required"),
  cover: z.string().optional(),
  manualInput: z.boolean().optional(),
  activityType: z.string(),
  durationFrom: z.string().optional(),
  durationTo: z.string().optional(),
});

export type ActivityType = z.infer<typeof ActivityValidator>;

export const DailyActivites = z.object({
  dailyActivities: z.array(
    ActivityValidator
  ),
});

export type DailyActivitesType = z.infer<typeof DailyActivites>;

export const TripValidator = z.object({
  title: z.string(),
  location: z.string(),
  duration: z.number(),
  itinerary: z
    .array(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        activities: z
          .array(
            z.object({
              title: z.string(),
              cover: z.string().optional(),
              manualInput: z.boolean().optional(),
              activityType: z.string().optional(),
              durationFrom: z.string().optional(),
              durationTo: z.string().optional(),
            }),
          )
          .optional(),
        comment: z.string().optional(),
      }),
    )
    .optional(),
});
export type Trip = z.infer<typeof TripValidator>;
