import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { ActivityType, DailyActivitesType } from "@/types/trip.types";
import { getUnsplashImage } from "@/lib/unsplash";
import { tripValidationSchema } from "@/lib/validations/trips";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input data
    const validationResult = tripValidationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { title, location, duration, itinerary } = validationResult.data;

    // Sanitize input data
    const sanitizedTitle = title.trim();
    const sanitizedLocation = location.trim();

    const coverPhoto = await getUnsplashImage(sanitizedLocation + " cityscape");

    if (coverPhoto.total === 0) {
      return NextResponse.json(
        { error: "Failed to fetch cover photo" },
        { status: 500 },
      );
    }

    const tripDetails = await db.tripDetails.create({
      data: {
        title: sanitizedTitle,
        location: sanitizedLocation,
        duration,
        username: session.user.username || "Anonymous",
        userId: session.user.id,
        coverPhoto: coverPhoto.images[0].url,
        photoCreditName: coverPhoto.images[0].creator?.username,
        photoCreditLink: coverPhoto.images[0].creator?.link,
        overview: {
          create: {
            summary: body.overview?.summary || "",
            activityTypes: body.overview?.activityTypes || [],
          },
        },
        itinerary: {
          create: {
            title: itinerary?.title || "",
            dailyTrip: {
              create: itinerary?.days?.map(
                (day: DailyActivitesType, index: number) => {
                  console.log("Day activities:", {
                    dayNumber: index + 1,
                    activities: day.dailyActivities,
                  });

                  return {
                    dayNumber: index + 1,
                    title: `Day ${index + 1}`,
                    overview: {
                      summary: "",
                      activityTypes: [],
                      destinations: [],
                    },
                    activities: {
                      create: day.dailyActivities.map(
                        (activity: ActivityType) => ({
                          placeId: activity.id || crypto.randomUUID(),
                          activityName: activity.title,
                          summary: "",
                          photos: activity.cover ? [activity.cover] : [],
                          location: activity.location || {},
                          activityType: activity.activityType,
                          time:
                            activity.durationFrom && activity.durationTo
                              ? `${activity.durationFrom}-${activity.durationTo}`
                              : null,
                          manualInput: Boolean(activity.manualInput),
                        }),
                      ),
                    },
                  };
                },
              ),
            },
          },
        },
      },
    });

    return NextResponse.json(tripDetails);
  } catch (error) {
    console.error("Error creating trip:", error);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 },
    );
  }
}
