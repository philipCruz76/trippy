import { z } from "zod";

export const tripValidationSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .trim(),

  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must not exceed 100 characters")
    .trim(),

  duration: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 day")
    .max(30, "Duration cannot exceed 30 days"),

  itinerary: z
    .object({
      title: z.string().optional(),
      days: z
        .array(
          z.object({
            dailyActivities: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                cover: z.string().optional(),
                location: z.object({
                  lat: z.number(),
                  lng: z.number(),
                }),
                activityType: z.string(),
                durationFrom: z.string(),
                durationTo: z.string(),
              }),
            ),
          }),
        )
        .optional(),
      comment: z.string().optional(),
    })
    .optional(),
});
