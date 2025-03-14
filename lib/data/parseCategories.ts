import { parse } from "csv-parse/sync";

// Import the CSV data directly
import csvData from "./places-and-apiv3-categories.csv";

export type CategoryData = {
  categories: Set<string>;
  idMapping: Map<string, string>; // maps formatted name to category ID
};

export function parseCategories(): CategoryData {
  const records =
    typeof csvData === "string"
      ? parse(csvData, {
          columns: true,
          skip_empty_lines: true,
        })
      : csvData;

  const mainCategories = new Set<string>();
  const idMapping = new Map<string, string>();

  records.forEach(
    (record: { "Category ID": string; "Category Label": string }) => {
      // Split the category label into parts
      const categoryParts = record["Category Label"].split(" > ");

      // Add each part of the hierarchy as a possible match
      categoryParts.forEach((part) => {
        const formattedName = part.toLowerCase().replace(/\s+/g, "_");
        mainCategories.add(formattedName);
        idMapping.set(formattedName, record["Category ID"]);
      });
    },
  );

  return {
    categories: mainCategories,
    idMapping,
  };
}

// Modify the getCategoryId function to use memoization for better performance
let cachedData: CategoryData | null = null;

export function getCategoryId(formattedName: string): string | undefined {
  if (!cachedData) {
    cachedData = parseCategories();
  }
  return cachedData.idMapping.get(formattedName);
}
