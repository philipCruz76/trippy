import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ActivityType, DailyActivitesType } from "@/types/trip.types";

type PostBody = {
  title: string;
  location: string;
  duration: number;
  itinerary:
    | {
        title?: string;
        days?: DailyActivitesType[];
        comment?: string;
      }
    | undefined;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, location, duration, itinerary } = body as PostBody;

    // Create the trip details with related records
    const tripDetails = await db.tripDetails.create({
      data: {
        title,
        location,
        duration,
        username: "Test User", // This should come from the session
        userId: "thisisatestid", // This should come from the session
        coverPhoto: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", // This should be dynamic
        overview: {
          create: {
            summary: itinerary?.comment || "",
            activityTypes: []
          }
        },
        itinerary: {
          create: {
            dailyTrip: {
              create: itinerary?.days?.map((day, index) => ({
                dayNumber: index + 1,
                title: `Day ${index + 1}`,
                overview: {
                  summary: "",
                  activityTypes: [],
                  destinations: []
                },
                locations: [],
                activities: {
                  create: day.dailyActivities.map((activity: ActivityType) => ({
                    activityType: activity.activityType,
                    activityName: activity.title,
                    summary: "",
                    placeId: activity.id || "",
                    photos: []
                  }))
                }
              }))
            }
          }
        }
      }
    });

    return NextResponse.json(tripDetails);
  } catch (error) {
    console.error("Error saving trip:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
