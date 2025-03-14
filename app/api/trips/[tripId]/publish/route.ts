import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { tripId: string } },
) {
  try {
    const tripId = params.tripId;
    const {
      title,
      coverPhoto,
      photoCreditName,
      photoCreditLink,
      activities,
      overviewSummary,
    } = await request.json();

    // ... existing validation code ...

    // Fetch trip data
    const trip = await db.tripDetails.findUnique({
      where: { id: tripId },
      include: {
        itinerary: {
          include: {
            dailyTrip: {
              include: {
                activities: true,
              },
            },
          },
        },
      },
    });

    // ... existing validation check ...

    // Create an array of all activity update promises
    const activityUpdates = activities.flatMap((dayActivities: any[], dayIndex: number) => {
      const dailyTrip = trip?.itinerary?.dailyTrip[dayIndex];
      if (!dailyTrip) return [];
      
      return dayActivities.map((activity, actIndex) => {
        if (!activity) return null;
        const existingActivity = dailyTrip.activities[actIndex];
        if (!existingActivity) return null;
        
        return db.activity.update({
          where: { id: existingActivity.id },
          data: { summary: activity.summary ?? "" },
        });
      }).filter((update): update is NonNullable<typeof update> => update !== null);
    });

    // Execute all updates in parallel
    const [updatedTrip] = await Promise.all([
      // Update trip details, overview, and publish status
      db.tripDetails.update({
        where: { id: tripId },
        data: {
          published: true,
          title,
          coverPhoto,
          photoCreditName,
          photoCreditLink,
          overview: {
            update: {
              summary: overviewSummary || "",
            },
          },
        },
        include: {
          itinerary: {
            include: {
              dailyTrip: {
                include: {
                  activities: true,
                },
              },
            },
          },
        },
      }),
      // Spread the activity updates array to execute all in parallel
      ...activityUpdates,
    ]);

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error("Error publishing trip:", error);
    return NextResponse.json(
      { error: "Failed to publish trip" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tripId: string } },
) {
  try {
    const tripId = params.tripId;

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 },
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
    console.error("Error unpublishing trip:", error);
    return NextResponse.json(
      { error: "Failed to unpublish trip" },
      { status: 500 },
    );
  }
}
