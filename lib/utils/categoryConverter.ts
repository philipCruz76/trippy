import { getCategoryId } from "../data/parseCategories";

export function convertCategoriesToIds(categories: string[]): string[] {
  return categories
    .map((category) => {
      const formattedCategory = category.toLowerCase().replace(/\s+/g, "_");
      const id = getCategoryId(formattedCategory);
      if (!id) {
        console.warn(`No ID found for category: ${category}`);
      }
      return id;
    })
    .filter((id): id is string => !!id);
}
