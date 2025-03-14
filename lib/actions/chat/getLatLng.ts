import { openai } from "@/lib/openai";
import { ChatMessage } from "@/types/openai.types";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

const LatLng = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type LatLngResult = z.infer<typeof LatLng>;

export async function getLatLng(location: string) {
  const message: ChatMessage[] = [
    {
      role: "system",
      content: `You are a trip planner. You help give out answers for travel destinations in JSON format that complies witht he google.maps.LatLng type only If the user does not provide a valid name for the city then throw an error. For example the google.maps.LatLng location for the city of Lisbon is:
       {
        "lat": 38.72225,
        "lng": -9.13933
        } `,
    },
    {
      role: "user",
      content: `What is the google.maps.LatLng type definition for the city of ${location} ?`,
    },
  ];

  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      max_tokens: 100,
      messages: message,
      temperature: 0.2,
      n: 1,
      response_format: zodResponseFormat(LatLng, "location"),
    });

    const location = response.choices[0].message.content;
    return location;
  } catch (error) {
    console.error("AI_KEYWORD_CLASSIFICATION_ERROR:", error);
    return null;
  }
}
