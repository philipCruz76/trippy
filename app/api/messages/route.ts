import { getKeywordClassifications } from "@/lib/actions/chat/getKeywordClassifications";
import { getLatLng } from "@/lib/actions/chat/getLatLng";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, chatId, previousKeywords } = body;

    const keywordResult = await getKeywordClassifications({
      userInput: text,
      previousKeywords: previousKeywords || undefined,
    });

    if (
      !keywordResult.classification ||
      keywordResult.classification.location === "Error"
    ) {
      return NextResponse.json(
        {
          aiResponse: null,
          aiLocation: null,
          message: keywordResult.message,
        },
        { status: 400 },
      );
    }

    // Only proceed with location lookup if we have a valid location
    if (keywordResult.classification.foundKeywords.location) {
      const location = await getLatLng(keywordResult.classification.location);

      if (location) {
        return NextResponse.json({
          aiResponse: keywordResult.classification,
          aiLocation: JSON.parse(location),
          message: keywordResult.message,
        });
      }
    }

    // Return just the message if we're still gathering information
    return NextResponse.json({
      aiResponse: keywordResult.classification,
      aiLocation: null,
      message: keywordResult.message,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        aiResponse: null,
        aiLocation: null,
        message: "I encountered an error. Could you try again?",
      },
      { status: 500 },
    );
  }
}
