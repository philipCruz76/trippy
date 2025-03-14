import db from "@/lib/db";

export const revalidate = 60 * 3; // revalidate at most every 5 minutes

export default async function getTrips() {
  try {
    const response = await db.tripDetails.findMany({
      include: {
        user: true,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching trips:", error);
    return null;
  }
}
