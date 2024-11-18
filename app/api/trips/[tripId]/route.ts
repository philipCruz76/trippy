import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = params.tripId;

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const tripDetails = await db.tripDetails.findUnique({
      where: {
        id: tripId,
      },
      include: {
        overview: true,
        itinerary: {
          include: {
            dailyTrip: {
              include: {
                activities: true
              },
              orderBy: {
                dayNumber: 'asc'
              }
            }
          }
        }
      }
    });

    if (!tripDetails) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the TripDetails type
    const transformedData = {
      title: tripDetails.title,
      username: tripDetails.username,
      location: tripDetails.location,
      coverPhoto: tripDetails.coverPhoto,
      duration: tripDetails.duration,
      overview: {
        summary: tripDetails.overview?.summary,
        activityTypes: tripDetails.overview?.activityTypes || []
      },
      itinerary: {
        dailyTrip: tripDetails.itinerary?.dailyTrip.map(day => ({
          overview: day.overview,
          locations: day.locations,
          itinerary: [{
            title: day.title,
            activities: day.activities.map(activity => ({
              activityName: activity.activityName,
              summary: activity.summary,
              photos: activity.photos || [],
              location: activity.location,
              activityType: activity.activityType,
              time: activity.time
            }))
          }]
        })),
        locationTrip: []
      }
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("[TRIP_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
