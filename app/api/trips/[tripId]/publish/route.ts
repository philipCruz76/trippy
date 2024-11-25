import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = params.tripId;
    const { title, coverPhoto, photoCreditName, photoCreditLink, activities } = await request.json();

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    // First, get the trip's itinerary to access dailyTrips
    const trip = await db.tripDetails.findUnique({
      where: { id: tripId },
      include: {
        itinerary: {
          include: {
            dailyTrip: {
              include: {
                activities: true
              }
            }
          }
        }
      }
    });

    if (!trip?.itinerary?.dailyTrip) {
      return NextResponse.json(
        { error: "Trip itinerary not found" },
        { status: 404 }
      );
    }

    // Update each activity's summary based on the activities array from the request
    for (let dayIndex = 0; dayIndex < activities.length; dayIndex++) {
      const dayActivities = activities[dayIndex];
      const dailyTrip = trip.itinerary.dailyTrip[dayIndex];
      
      if (dailyTrip && dayActivities) {
        // Update each activity's summary
        for (let actIndex = 0; actIndex < dayActivities.length; actIndex++) {
          const activity = dailyTrip.activities[actIndex];
          if (activity) {
            await db.activity.update({
              where: { id: activity.id },
              data: { summary: dayActivities[actIndex].summary || '' }
            });
          }
        }
      }
    }

    // Update the trip details
    const updatedTrip = await db.tripDetails.update({
      where: {
        id: tripId,
      },
      data: {
        published: true,
        title,
        coverPhoto,
        photoCreditName,
        photoCreditLink,
      },
      include: {
        itinerary: {
          include: {
            dailyTrip: {
              include: {
                activities: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error('Error publishing trip:', error);
    return NextResponse.json(
      { error: "Failed to publish trip" },
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

    const updatedTrip = await db.tripDetails.update({
      where: {
        id: tripId,
      },
      data: {
        published: false,
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error('Error unpublishing trip:', error);
    return NextResponse.json(
      { error: "Failed to unpublish trip" },
      { status: 500 }
    );
  }
}