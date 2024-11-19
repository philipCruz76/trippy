import {
  getKeywordClassifications,
  KeywordClassificationsType,
} from "@/lib/actions/chat/getKeywordClassifications";
import { getLatLng, LatLngResult } from "@/lib/actions/chat/getLatLng";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, chatId } = body;

    const response = await getKeywordClassifications(text).then(
      async (result) => {
        if (result) {
          const parsedResult = JSON.parse(result) as KeywordClassificationsType;

          parsedResult.activityTypes
          return parsedResult;
        }
      },
    );
   
    if (!response || response.location === "Error") {
      return new NextResponse("Error getting response from Trippy", {
        status: 400,
      });
    }

    const location = await getLatLng(response.location).then((result) => {
      if (result) {
        const parsedResult = JSON.parse(result) as LatLngResult;
        return parsedResult;
      }
    });

    if (!location) {
      return new NextResponse("Error getting location from Trippy", {
        status: 400,
      });
    }

    return NextResponse.json({ aiResponse: response, aiLocation: location });
  } catch (error) {
    console.error(error);
    return new NextResponse("MESSAGE_SEND_ERROR", { status: 500 });
  }
}
