import db from "../db";
import { toLatLngLiteral } from "@/lib/utils";

type SearchParams = {
  latitude: number;
  longitude: number;
  includedTypes: string[];
  excludedTypes?: string[];
  radius?: number;
};

export async function findOrCreateSearchQuery({
  latitude,
  longitude,
  includedTypes,
}: SearchParams) {
  // Look for existing similar queries
  const existingQueries = await db.searchQuery.findMany({
    where: {
      AND: [
        {
          latitude: {
            gte: latitude - 0.01,
            lte: latitude + 0.01,
          },
          longitude: {
            gte: longitude - 0.01,
            lte: longitude + 0.01,
          },
        },
        {
          includedTypes: {
            hasSome: includedTypes,
          },
        },
      ],
    },
    include: {
      activities: true,
    },
  });

  console.log("Existing queries:", existingQueries);
  // Find queries with sufficient overlap (e.g., 50%)
  const minOverlapPercentage = 0.5;
  const matchingQuery = existingQueries.find(query => {
    const overlap = query.includedTypes.filter(type => 
      includedTypes.includes(type)
    ).length;
    const overlapPercentage = overlap / Math.max(includedTypes.length, query.includedTypes.length);
    return overlapPercentage >= minOverlapPercentage;
  });

  console.log("Matching query:", matchingQuery);

  if (matchingQuery) {
    return matchingQuery.activities;
  }

  // If no existing query found, create new one
  const newQuery = await db.searchQuery.create({
    data: {
      latitude,
      longitude,
      includedTypes,
    },
  });

  return newQuery;
}
