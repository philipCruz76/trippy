"use server";

import db from "../db";

export default async function getDestinationData() {
  try {
    const data = await db.destinations.findMany({
      where: {
        NOT: {
          photo: {
            equals: "NOT_AVAILABLE",
          },
        },
      },
    });

    if (!data) throw new Error("DESTINATION_NOT_FOUND_ERROR");

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
