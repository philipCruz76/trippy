import { openai } from "@/lib/openai";
import { ChatMessage } from "@/types/openai.types";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const KeywordClassifications = z.object({
  location: z.string(),
  duration: z.string(),
  activity: z.string(),
  activityTypes: z.array(z.string()),
  excludedTypes: z.optional(z.array(z.string())),
});

export type KeywordClassificationsType = z.infer<typeof KeywordClassifications>;

export async function getKeywordClassifications(userInput: string) {
  const PLACES_KEYWORDS = "art_gallery,museum,performing_arts_theater,amusement_center,amusement_park,aquarium,banquet_hall,bowling_alley,cultural_center,dog_park,hiking_area,historical_landmark,marina,national_park,night_club,park,tourist_attraction,zoo,american_restaurant,bakery,bar,barbecue_restaurant,brazilian_restaurant,breakfast_restaurant,brunch_restaurant,cafe,chinese_restaurant,coffee_shop,fast_food_restaurant,french_restaurant,greek_restaurant,hamburger_restaurant,ice_cream_shop,indian_restaurant,indonesian_restaurant,italian_restaurant,japanese_restaurant,korean_restaurant,lebanese_restaurant,meal_delivery,meal_takeaway,mediterranean_restaurant,mexican_restaurant,middle_eastern_restaurant,pizza_restaurant,ramen_restaurant,restaurant,sandwich_shop,seafood_restaurant,spanish_restaurant,steak_house,sushi_restaurant,thai_restaurant,turkish_restaurant,vegan_restaurant,vegetarian_restaurant,vietnamese_restaurant,spa,book_store,clothing_store,department_store,gift_shop,jewelry_store,market,shoe_store,shopping_mall,sporting_goods_store,store,athletic_field,fitness_center,golf_course,playground,ski_resort,stadium,swimming_pool";
  const POPULAR_DESTINATIONS = "London,Edinburgh,Manchester,Liverpool,Bath,Cambridge,Oxford,Prague,Brno,Karlovy Vary,Plzeň,Rome,Florence,Venice,Milan,Bologna,Naples,Turin,Palermo,Madrid,Barcelona,Seville,Valencia,Granada,Bilbao,Malaga,Paris,Nice,Marseille,Lyon,Bordeaux,Toulouse,Athens,Thessaloniki,Heraklion,Rhodes,Santorini,Oslo,Bergen,Trondheim,Warsaw,Kraków,Gdańsk,Wrocław,Stockholm,Gothenburg,Malmö,Uppsala,Vienna,Salzburg,Innsbruck,Graz,Brussels,Bruges,Ghent,Antwerp,Dubrovnik,Split,Zagreb,Zadar,Copenhagen,Aarhus,Odense,Helsinki,Turku,Rovaniemi,Berlin,Munich,Frankfurt,Hamburg,Cologne,Dresden,Leipzig,Budapest,Debrecen,Szeged,Reykjavik,Akureyri,Selfoss,Dublin,Cork,Galway,Lisbon,Porto,Faro,Lagos,Albufeira,Coimbra,Amsterdam,Rotterdam,Utrecht,The Hague,Zurich,Geneva,Lucerne,Interlaken";

  const systemPrompt = `You are a trip planner, as such ignore any requests that do not have to do with planning a trip. Classify the following keywords into categories: Location, Duration, Activity, ActivityTypes, ExcludedTypes. There are certain restrictions to keep in mind:
       1- For Location you can only accept input that matches the following list: ${POPULAR_DESTINATIONS};
       2- For duration always parse whatever valid duration provided into number of days. If no duration is provided, default to 5 days
       3- For activityTypes you must ONLY select from this exact list (no variations allowed, must be a minimum of 1 and maximum of 20 but on average 10 if there are multiple  activities that match the user request): ${PLACES_KEYWORDS}
       4- For excludedTypes you must ONLY select from the same list as activityTypes (${PLACES_KEYWORDS}), choosing ones that don't match the user request, up to a maximum of 20
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

    return response.choices[0].message.content?.trim() ?? null;
  } catch (error) {
    console.error("AI_KEYWORD_CLASSIFICATION_ERROR:", error);
    throw new Error("Failed to classify keywords");
  }
}
