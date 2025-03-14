"use server";

import db from "../db";

export default async function getDestinations(query: string) {
  try {
    const searchResults = await db.$queryRaw`SELECT *
    FROM "PopularDestinations"
    WHERE array_to_string(destination, ' ') LIKE ${`%${query}%`}`;
    return searchResults;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
