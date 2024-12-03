import getDailyItinerary from "@/lib/actions/chat/getDailyItinerary";
import { mapboxToGPTInput } from "@/lib/utils/mapbox-converters";
import { MapboxPlace } from "@/types/mapbox.types";
import { NextResponse } from "next/server";

type RequestType = {
  location: string;
  inputDestinations: MapboxPlace[];
  duration: number;
};
export async function POST(request: Request) {
  try {
    const body: RequestType = await request.json();
    const { location, inputDestinations, duration } = body;

    const chatInput = {
      location,
      activities: mapboxToGPTInput(inputDestinations),
      duration,
    };
    
    const response = await getDailyItinerary(chatInput)
    
    if (!response ) {
      return new NextResponse("Error getting response from Trippy", {
        status: 400,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return new NextResponse("MESSAGE_SEND_ERROR", { status: 500 });
  }
}
