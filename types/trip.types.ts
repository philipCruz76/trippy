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
  id: string;
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
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  summary: z.string().optional(),
  activityType: z.string(),
  durationFrom: z.string().optional(),
  durationTo: z.string().optional(),
});

export type ActivityType = z.infer<typeof ActivityValidator>;

export const DailyActivites = z.object({
  dailyActivities: z.array(ActivityValidator),
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

export const TripDetailsValidator = z.object({
  title: z.string(),
  username: z.string(),
  coverPhoto: z.string(),
  photoCreditName: z.string().optional(),
  photoCreditLink: z.string().optional(),
  location: z.string(),
  duration: z.number(),
  published: z.boolean(),
  overview: z.object({
    summary: z.string(),
    activityTypes: z.array(z.map(z.string(), z.number())),
  }),
  itinerary: z.object({
    dailyTrip: z.array(
      z.object({
        overview: z.object({
          summary: z.string(),
          activityTypes: z.array(z.map(z.string(), z.number())),
          destinations: z.array(
            z.object({
              name: z.string(),
              photos: z.array(z.string()),
            }),
          ),
        }),
        itinerary: z.array(
          z.object({
            title: z.string(),
            activities: z.array(
              z.object({
                place_id: z.string(),
                activityName: z.string(),
                summary: z.string(),
                photos: z.array(z.string()),
                formatted_address: z.string(),
                location: z.object({
                  lat: z.number(),
                  lng: z.number(),
                }),
                activityType: z.string().optional(),
                time: z.string().optional(),
              }),
            ),
          }),
        ),
      }),
    ),
    locationTrip: z.array(
      z.object({
        title: z.string(),
        username: z.string(),
        location: z.string(),
        numberOfPlaces: z.number(),
        overview: z.string(),
        places: z.array(
          z.object({
            placeName: z.string(),
            placeType: z.string().optional(),
            placePhotos: z.array(z.string()),
            description: z.string().optional(),
          }),
        ),
        locations: z.array(z.custom<google.maps.places.Place>()),
      }),
    ),
  }),
});
export type TripDetails = z.infer<typeof TripDetailsValidator>;
