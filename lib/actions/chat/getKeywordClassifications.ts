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
  foundKeywords: z.object({
    location: z.boolean(),
    duration: z.boolean(),
    activity: z.boolean(),
    activityTypes: z.boolean(),
  }),
});

export type KeywordClassificationsType = z.infer<typeof KeywordClassifications>;

function validateKeywordLists(
  data: KeywordClassificationsType,
  validKeywords: string,
): KeywordClassificationsType {
  const keywordSet = new Set(validKeywords.split(","));

  return {
    ...data,
    activityTypes: data.activityTypes.filter((type) => keywordSet.has(type)),
    excludedTypes:
      data.excludedTypes?.filter((type) => keywordSet.has(type)) || [],
  };
}

type KeywordClassificationResult = {
  classification: KeywordClassificationsType | null;
  message: string;
};

type KeywordClassificationInput = {
  userInput: string;
  previousKeywords?: KeywordClassificationsType;
};

export async function getKeywordClassifications({
  userInput,
  previousKeywords,
}: KeywordClassificationInput): Promise<KeywordClassificationResult> {
  const { categories } = parseCategories();
  const validCategories = Array.from(categories).join(",");

  const systemPrompt = `You are a trip planner, as such ignore any requests that do not 
 have to do with planning a trip. Classify the following keywords into categories: 
 Location, Duration, Activity, ActivityTypes, ExcludedTypes. There are certain 
 restrictions to keep in mind:
1- For Location you can only accept input that matches the following list: ${POPULAR_DESTINATIONS};
2- For duration always parse whatever valid duration provided into number of 
days. If no duration is provided, default to 5 days
3- For activityTypes you must ONLY select from this exact list (no variations 
allowed, must be a minimum of 1 and maximum of 20 but on average 10 if there are 
multiple activities that match the user request): ${validCategories}
4- For excludedTypes you must ONLY select from the same list as activityTypes ($
{validCategories}), choosing ones that don't match the user request, up to a 
maximum of 20
If you don't have enough information to classify the keywords, set foundKeywords to false and prompt the user to provide the missing information, otherwise set it 
to true and finish the classification.
  Always set foundKeywords flags to true for:
- location when a valid city is mentioned
- duration when days are mentioned or using default
- activity and activityTypes when relevant activities are identified

  Previous information gathered:
  ${previousKeywords ? JSON.stringify(previousKeywords, null, 2) : "No previous information"}
`;

  const userMessage = previousKeywords
    ? `Based on the previous information and this new input: "${userInput}", update or add any missing trip details.`
    : `Parse through the following input *${userInput}* and derive the 
      necessary keywords from it and output it in JSON.
      Please format the response in JSON as follows, ensuring activityTypes and 
      excludedTypes are EXACT matches from the provided list: 
      {
        "location": The name of the city the travel plan will made for,
        "duration": The Numerical representation in days of the duration of the trip,
        "activity": The main category/categories of activitivies to center the trip 
        around,
        "activityTypes": List of EXACT matching activityTypes from the provided list only
        "excludedTypes": List of EXACT conflicting activityTypes from the provided list 
        only
        "foundKeywords": Flags to indicate if the information was found
      }`;

  const assistantExample = {
    role: "assistant",
    content: `
    1. If user says "I want to visit Paris" or something similar that includes the city name: Set location="Paris", foundKeywords.location=true
    2. If they then say "for 3 days": Set duration="3", foundKeywords.duration=true
    3. If they say "I love museums" or something similar that includes the activity type: Set activity="cultural", activityTypes=["museum", "art_gallery"], foundKeywords.activity=true
    4. If they say "I love museums and I want to visit Paris for 3 days": Set location="Paris", duration="3", activity="cultural", activityTypes=["museum", "art_gallery"], foundKeywords.location=true, foundKeywords.duration=true, foundKeywords.activity=true
    `,
  };

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "assistant", content: assistantExample.content },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.1,
      max_tokens: 1000,
      n: 1,
      response_format: zodResponseFormat(
        KeywordClassifications,
        "classification",
      ),
    });

    const result = response.choices[0].message.content?.trim() ?? null;
    const parsedResult = result
      ? validateKeywordLists(JSON.parse(result), validCategories)
      : null;

    let message = "";
    if (parsedResult) {
      const { foundKeywords } = parsedResult;

      console.log(foundKeywords);
      if (foundKeywords.location === false) {
        message = "Could you please specify which city you'd like to visit?";
      } else if (foundKeywords.duration === false) {
        message = `How many days would you like to spend in ${parsedResult.location}?`;
      } else if (foundKeywords.activity === false) {
        message = `What kind of activities would you like to do in ${parsedResult.location}?`;
      } else {
        message = `Great! I'll help you plan a ${parsedResult.duration}-day trip to ${parsedResult.location}, focusing on ${parsedResult.activity}. I'll find some interesting places for you.`;
      }
    } else {
      message =
        "I couldn't understand your request. Could you please provide a destination and how long you'd like to stay?";
    }

    return {
      classification: parsedResult,
      message,
    };
  } catch (error) {
    console.error("AI_KEYWORD_CLASSIFICATION_ERROR:", error);
    return {
      classification: null,
      message:
        "I'm having trouble understanding your request. Could you please rephrase it?",
    };
  }
}
