import { POPULAR_DESTINATIONS } from "@/constants/map-constants";
import { openai } from "@/lib/openai";
import { ChatMessage } from "@/types/openai.types";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { parseCategories } from "@/lib/data/parseCategories";

const KeywordClassifications = z.object({
  location: z.string(),
  duration: z.string(),
  activity: z.string(),
  activityTypes: z.array(z.string()),
  excludedTypes: z.optional(z.array(z.string())),
});

export type KeywordClassificationsType = z.infer<typeof KeywordClassifications>;

function validateKeywordLists(data: KeywordClassificationsType, validKeywords: string): KeywordClassificationsType {
  const keywordSet = new Set(validKeywords.split(','));
  
  return {
    ...data,
    activityTypes: data.activityTypes.filter(type => keywordSet.has(type)),
    excludedTypes: data.excludedTypes?.filter(type => keywordSet.has(type)) || []
  };
}

export async function getKeywordClassifications(userInput: string) {
  const { categories } = parseCategories();
  const validCategories = Array.from(categories).join(',');

  const systemPrompt = `You are a trip planner, as such ignore any requests that do not have to do with planning a trip. Classify the following keywords into categories: Location, Duration, Activity, ActivityTypes, ExcludedTypes. There are certain restrictions to keep in mind:
       1- For Location you can only accept input that matches the following list: ${POPULAR_DESTINATIONS};
       2- For duration always parse whatever valid duration provided into number of days. If no duration is provided, default to 5 days
       3- For activityTypes you must ONLY select from this exact list (no variations allowed, must be a minimum of 1 and maximum of 20 but on average 10 if there are multiple  activities that match the user request): ${validCategories}
       4- For excludedTypes you must ONLY select from the same list as activityTypes (${validCategories}), choosing ones that don't match the user request, up to a maximum of 20
       If you cannot follow these restrictions throw an Error
  `;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { 
      role: "user", 
      content: `Parse through the following input *${userInput}* and derive the necessary keywords from it and output it in JSON.
      Please format the response in JSON as follows, ensuring activityTypes and excludedTypes are EXACT matches from the provided list: 
      {
        "location": The name of the city the travel plan will made for,
        "duration": The Numerical representation in days of the duration of the trip,
        "activity": The main category/categories of activitivies to center the trip around,
        "activityTypes": List of EXACT matching activityTypes from the provided list only
        "excludedTypes": List of EXACT conflicting activityTypes from the provided list only
      }`
    },
    {
      role: "assistant",
      content: "An example response would be: For a food tour in Lisbon for 3 days, activityTypes would include: restaurant, cafe, bakery, meal_delivery (all exact matches from the list), and excludedTypes might include: hiking_area, swimming_pool, spa (all exact matches from the list)."
    }
  ];

  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.1,
      max_tokens: 1000,
      n: 1,
      response_format: zodResponseFormat(KeywordClassifications, "classification"),
    });

    const result = response.choices[0].message.content?.trim() ?? null;
    
    return result ? validateKeywordLists(JSON.parse(result), validCategories) : null;
  } catch (error) {
    console.error("AI_KEYWORD_CLASSIFICATION_ERROR:", error);
    throw new Error("Failed to classify keywords");
  }
}
