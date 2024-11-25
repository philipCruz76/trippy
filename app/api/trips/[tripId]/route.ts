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
      published: tripDetails.published,
      overview: {
        summary: tripDetails.overview?.summary ?? "",
        activityTypes: tripDetails.overview?.activityTypes as Record<string, number>[] ?? []
      },
      itinerary: {
        dailyTrip: tripDetails.itinerary?.dailyTrip.map(day => ({
          overview: {
            summary: (day.overview as any).summary ?? "",
            activityTypes: (day.overview as any).activityTypes ?? [],
            destinations: (day.overview as any).destinations ?? []
          },
          itinerary: [{
            title: day.title,
            activities: day.activities.map(activity => ({
              place_id: activity.placeId,
              activityName: activity.activityName,
              summary: activity.summary,
              photos: activity.photos,
              formatted_address: (activity.location as any).formatted_address ?? "",
              location: {
                lat: (activity.location as any).lat ?? 0,
                lng: (activity.location as any).lng ?? 0
              },
              activityType: activity.activityType,
              time: activity.time
            }))
          }]
        })) ?? [],
        locationTrip: [] // This remains empty as per the original code
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

export async function DELETE(
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

    // Delete the trip from the database
    await db.tripDetails.delete({
      where: {
        id: tripId,
      },
    });

    return NextResponse.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}