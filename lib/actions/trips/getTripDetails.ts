import { TripDetails } from "@/types/trip.types";

export async function getTripDetails(
  tripId: string,
): Promise<TripDetails | null> {
  try {
    const response = await fetch(`${process.env.API_URL}/trips/${tripId}`, {
      next: {
        revalidate: 60, // Cache for 1 minute
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching trip details:", error);
    return null;
  }
}
