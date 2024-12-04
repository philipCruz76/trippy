import { findOrCreateSearchQuery } from "@/lib/actions/searchPlaces";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, includedTypes } = body;
    
    const searchQueryResult = await findOrCreateSearchQuery({
      latitude,
      longitude,
      includedTypes,
    });

    return new NextResponse(JSON.stringify(searchQueryResult), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Search query error:', error);
    return new NextResponse("Failed to process search query", { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 