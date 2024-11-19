import getDailyItinerary from "@/lib/actions/chat/getDailyItinerary";
import { GPTDestinationInput, GPTItineraryStructure } from "@/types/trip.types";
import { NextResponse } from "next/server";

type RequestType = {
  location: string;
  inputDestinations: GPTDestinationInput[];
  places: google.maps.places.Place[];
  duration: number;
};
export async function POST(request: Request) {
  try {
    const body: RequestType = await request.json();
    const { location, inputDestinations, duration } = body;

    const chatInput: GPTItineraryStructure= {
      location: location,
      activities: inputDestinations,
      duration: duration,
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
