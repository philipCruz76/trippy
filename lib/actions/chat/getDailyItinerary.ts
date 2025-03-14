"use server";
import { openai } from "@/lib/openai";
import { ChatMessage } from "@/types/openai.types";
import { GPTItineraryStructure } from "@/types/trip.types";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const DailyItinerary = z.object({
  title: z.string(),
  summary: z.string(),
  days: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      activities: z.array(
        z.object({
          id: z.string(),
          index: z.number(),
          name: z.string(),
          location: z.object({
            lat: z.number(),
            lng: z.number(),
          }),
          editorialSummary: z.string().optional(),
        }),
      ),
    }),
  ),
});

export type DailyItineraryType = z.infer<typeof DailyItinerary>;

const SYSTEM_PROMPT = `You are a trip planning AI. Create concise day-by-day itineraries following these strict rules:
- You will ALWAYS receive exactly 20 activities as input
- You MUST use ALL 20 activities in your output - no more, no less
- ONLY use activities from the provided list - do not create new ones
- Group the provided activities that are geographically close and fit a day theme/title
- Use the exact activity details (name, id, location) as provided in the input
- Each activity should only be used once in the itinerary
- In the day description, list each activity name followed by its editorial summary
Return JSON matching the specified format.`;

const ASSISTANT_EXAMPLE = {
  role: "assistant",
  content: `Here's an example of the expected output format:
{
  "title": "Historic sights of Lisbon",
  "summary": "A perfect 3-day exploration of Lisbon combining historic sites and local experiences",
  "days": [
    {
      "title": "Historic Center Exploration",
      "description": "Start your day at São Jorge Castle: A medieval castle offering panoramic views of Lisbon. Then visit Lisbon Cathedral: The city's oldest church with remarkable Gothic architecture. End at Time Out Market: A vibrant food hall showcasing the best of Portuguese cuisine.",
      "activities": [
        {
          "id": "castle123",
          "name": "São Jorge Castle",
          "editorialSummary": "A medieval castle offering panoramic views of Lisbon",
          "location": {
            "lat": 38.7139,
            "lng": -9.1334
          }
        },
        {
          "id": "cathedral456",
          "name": "Lisbon Cathedral",
          "editorialSummary": "The city's oldest church with remarkable Gothic architecture",
          "location": {
            "lat": 38.7098,
            "lng": -9.1325
          }
        }
      ]
    }
  ]
}`,
};

const ASSISTANT_EXAMPLE_1 = {
  role: "assistant",
  content: `Here's how to structure a day with multiple activities in close proximity:
{
  "title": "Discovering Porto's Food & Wine Heritage",
  "summary": "A culinary journey through Porto's historic center",
  "days": [
    {
      "title": "Porto's Food & Wine Heritage",
      "description": "Start your day at Mercado do Bolhão, where you'll discover Porto's vibrant local produce and delicacies in this historic market setting. Around midday, make your way to Graham's Port Lodge, one of Porto's most prestigious port wine cellars, offering both stunning views and exceptional wine tasting experiences. Complete your gastronomic journey at the elegant Café Majestic, a historic Art Nouveau café where you can indulge in traditional Portuguese pastries while admiring the ornate Belle Époque interiors.",
      "activities": [
        {
          "id": "market789",
          "name": "Mercado do Bolhão",
          "editorialSummary": "A historic market showcasing local produce and delicacies",
          "location": {
            "lat": 41.1486,
            "lng": -8.6062
          }
        },
        {
          "id": "port123",
          "name": "Graham's Port Lodge",
          "editorialSummary": "One of Porto's oldest port wine cellars with stunning views",
          "location": {
            "lat": 41.1334,
            "lng": -8.6167
          }
        },
        {
          "id": "cafe456",
          "name": "Café Majestic",
          "editorialSummary": "A historic Art Nouveau café known for its ornate interiors and traditional pastries",
          "location": {
            "lat": 41.1467,
            "lng": -8.6067
          }
        }
      ]
    }
  ]
}`,
};

const ASSISTANT_EXAMPLE_2 = {
  role: "assistant",
  content: `Here's how to structure multiple days with thematic grouping:
{
  "title":"Gaudi's Barcelona Experience",
  "summary": "Discover Barcelona through Gaudí's masterpieces and authentic local experiences",
  "days": [
    {
      "title": "Day 1: Gaudí's Architectural Wonders",
      "description": "Begin your architectural journey at the awe-inspiring Sagrada Familia, Gaudí's unfinished masterpiece and Barcelona's most iconic landmark. The morning light creates a magical display through the stained glass windows. In the afternoon, visit Casa Batlló, where you'll discover the unique modernist style that made Gaudí famous. The building's dragon-like roof and skeletal facade tell fascinating stories of architectural innovation.",
      "activities": [
        {
          "id": "sagrada123",
          "name": "Sagrada Familia",
          "editorialSummary": "Gaudí's unfinished masterpiece and Barcelona's most iconic landmark",
          "location": {
            "lat": 41.4036,
            "lng": 2.1744
          }
        },
        {
          "id": "batllo456",
          "name": "Casa Batlló",
          "editorialSummary": "A modernist building showcasing Gaudí's unique architectural style",
          "location": {
            "lat": 41.3917,
            "lng": 2.1649
          }
        }
      ]
    },
    {
      "title": "Day 2: Barcelona's Local Life",
      "description": "Start your morning at the vibrant La Boqueria Market, where the colors and aromas of fresh local produce create an unforgettable sensory experience. Later, lose yourself in the Gothic Quarter's medieval maze of streets and hidden squares, where every corner reveals a new historical treasure. Each stone tells a story of Barcelona's rich past, from Roman times to the present day.",
      "activities": [
        {
          "id": "market789",
          "name": "La Boqueria Market",
          "editorialSummary": "Barcelona's most famous food market with fresh local produce",
          "location": {
            "lat": 41.3816,
            "lng": 2.1715
          }
        },
        {
          "id": "gothic101",
          "name": "Gothic Quarter",
          "editorialSummary": "The historic heart of Barcelona with medieval streets and hidden squares",
          "location": {
            "lat": 41.3833,
            "lng": 2.1777
          }
        }
      ]
    }
  ]
}`,
};

export default async function getDailyItinerary(
  chatInput: GPTItineraryStructure,
) {
  // 5. Simplified user prompt
  const userPrompt = `Create a ${chatInput.duration}-day itinerary for the following location: ${chatInput.location}. 
  Here are ALL 20 activities that MUST be included in the itinerary (use each activity exactly once and do not create new ones):
  ${JSON.stringify(chatInput.activities, null, 2)}
  
  Instructions:
  1. You MUST use ALL 20 activities provided - each activity should appear exactly once
  2. Distribute these 20 activities across ${chatInput.duration} days in a logical order
  3. Group nearby activities in the same day when possible
  4. Use the exact activity details (including IDs) from the provided list
  5. Create appropriate day titles and descriptions that include the names of the activities based on the grouped activities
  6. Do not create or suggest any additional activities beyond the 20 provided
  7. Verify that your response includes exactly 20 activities before returning`;

  const message: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "assistant", content: ASSISTANT_EXAMPLE.content },
    { role: "assistant", content: ASSISTANT_EXAMPLE_1.content },
    { role: "assistant", content: ASSISTANT_EXAMPLE_2.content },
    { role: "user", content: userPrompt },
  ];

  try {
    // 6. Optimized API call settings
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      max_tokens: 4000,
      messages: message,
      temperature: 0.1,
      n: 1,
      response_format: zodResponseFormat(DailyItinerary, "itinerary"),
    });

    const itinerary = response.choices[0].message.content?.trim();
    if (!itinerary) throw new Error("AI_ITINERARY_PLANNING_ERROR");

    // 7. Direct parsing and mapping
    const parsedResult = JSON.parse(itinerary) as DailyItineraryType;

    return {
      title: parsedResult.title,
      summary: parsedResult.summary,
      days: parsedResult.days,
    };
  } catch (error) {
    console.error("AI_ITINERARY_PLANNING_ERROR:", error);
    return null;
  }
}
