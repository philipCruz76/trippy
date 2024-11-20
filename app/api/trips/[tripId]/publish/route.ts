import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const tripId = params.tripId;
    const { title, coverPhoto } = await request.json();

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
        published: true,
        title: title,
        coverPhoto: coverPhoto,
      },
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