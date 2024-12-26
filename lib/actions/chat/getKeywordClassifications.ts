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

function validateKeywordLists(data: KeywordClassificationsType, validKeywords: string): KeywordClassificationsType {
  const keywordSet = new Set(validKeywords.split(','));
  
  return {
    ...data,
    activityTypes: data.activityTypes.filter(type => keywordSet.has(type)),
    excludedTypes: data.excludedTypes?.filter(type => keywordSet.has(type)) || []
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
  previousKeywords 
}: KeywordClassificationInput): Promise<KeywordClassificationResult> {
  const { categories } = parseCategories();
  const validCategories = Array.from(categories).join(',');

  const systemPrompt = `You are a trip planner assistant. Your task is to progressively build a trip plan by gathering necessary information through conversation. You have these requirements:

  1. Location must be from: ${POPULAR_DESTINATIONS}
  2. Duration must be in days (default to 5 if not specified)
  3. ActivityTypes must be from: ${validCategories}
  4. ExcludedTypes must be from: ${validCategories}

  Previous information gathered:
  ${previousKeywords ? JSON.stringify(previousKeywords, null, 2) : "No previous information"}

  Only update the foundKeywords flags to true when you are certain about the information.`;

  const userMessage = previousKeywords 
    ? `Based on the previous information and this new input: "${userInput}", update or add any missing trip details.`
    : `Parse this initial request: "${userInput}" and extract any trip planning details.`;

  const assistantExample = {
    role: "assistant",
    content: `I'll help gather the trip information progressively. For example:
    1. If user says "I want to visit Paris": Set location="Paris", foundKeywords.location=true
    2. If they then say "for 3 days": Set duration="3", foundKeywords.duration=true
    3. If they say "I love museums": Set activity="cultural", activityTypes=["museum", "art_gallery"], foundKeywords.activity=true`
  };

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "assistant", content: assistantExample.content },
    { role: "user", content: userMessage }
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
    const parsedResult = result ? validateKeywordLists(JSON.parse(result), validCategories) : null;
    
    let message = "";
    if (parsedResult) {
      const { foundKeywords } = parsedResult;
      
      if (!foundKeywords.location) {
        message = "Could you please specify which city you'd like to visit?";
      } else if (!foundKeywords.duration) {
        message = `How many days would you like to spend in ${parsedResult.location}?`;
      } else if (!foundKeywords.activity || !foundKeywords.activityTypes) {
        message = `What kind of activities would you like to do in ${parsedResult.location}?`;
      } else {
        message = `Great! I'll help you plan a ${parsedResult.duration}-day trip to ${parsedResult.location}, focusing on ${parsedResult.activity}. I'll find some interesting places for you.`;
      }
    } else {
      message = "I couldn't understand your request. Could you please provide a destination and how long you'd like to stay?";
    }

    return {
      classification: parsedResult,
      message
    };
  } catch (error) {
    console.error("AI_KEYWORD_CLASSIFICATION_ERROR:", error);
    return {
      classification: null,
      message: "I'm having trouble understanding your request. Could you please rephrase it?"
    };
  }
}
