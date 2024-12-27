import { MapboxCategory } from "@/types/mapbox.types";
import { serializeToBuffer, deserializeFromBuffer } from "../utils/buffer";
import categoriesJson from "./MapBoxCategories.json";

// Convert the large JSON to a buffer
const categoriesBuffer = serializeToBuffer(categoriesJson);

export function getMapBoxCategoryByName(name: string) {
  const categories = deserializeFromBuffer<MapboxCategory[]>(categoriesBuffer);
  return categories.find((category) => category.name === name);
}
