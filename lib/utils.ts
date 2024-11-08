import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DailyItineraryType } from "./actions/chat/getDailyItinerary";
import { Trip } from "@/types/trip.types";

/**
 * Combines class names using clsx and tailwind-merge
 * @param inputs - Array of class values to be combined
 * @returns Combined and merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats large numbers into human-readable strings with k/M suffixes
 * @param inputNumber - Number to format
 * @returns Formatted string (e.g. "1.2k" or "1.5M")
 */
export function formatNum(inputNumber: number) {
  if (inputNumber >= 1000 && inputNumber < 1000000) {
    return (inputNumber / 1000).toFixed(1) + "k";
  } else if (inputNumber >= 1000000 && inputNumber < 1000000000) {
    return (inputNumber / 1000000).toFixed(1) + "M";
  } else {
    return inputNumber.toString();
  }
}

/**
 * Type guard to check if an object is a valid Google Maps LatLngLiteral
 * @param obj - Object to check
 * @returns Boolean indicating if object is a valid LatLngLiteral
 */
export function isLatLngLiteral(
  obj: unknown,
): obj is google.maps.LatLngLiteral {
  if (!obj || typeof obj !== "object") return false;
  if (!("lat" in obj && "lng" in obj)) return false;

  return Number.isFinite(obj.lat) && Number.isFinite(obj.lng);
}

/**
 * Converts a LatLng google.maps object into LatLngLiteral
 * @param obj
 * @returns google.maps.LatLngLiteral formatted object
 */
export function toLatLngLiteral(
  obj: google.maps.LatLngLiteral | google.maps.LatLng,
): google.maps.LatLngLiteral {
  if (isLatLngLiteral(obj)) return obj;
  return obj.toJSON();
}

/**
 * Converts a time string in 24-hour format (HH:mm) to total minutes since midnight
 * @param timeString - Time string in format "HH:mm" (e.g., "23:30", "09:45")
 * @returns Total minutes since midnight
 * @throws Error if the time string format is invalid
 */
export function timeStringToMinutes(timeString: string): number {
  

  const [hours, minutes] = timeString.split(":").map(Number);

  // Validate hour and minute ranges (redundant with regex but adds type safety)
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid hours or minutes values");
  }

  return hours * 60 + minutes;
}

/**
 * Converts total minutes since midnight to a time string in 24-hour format (HH:mm)
 * @param totalMinutes - Total minutes since midnight (0 to 1439)
 * @returns Time string in format "HH:mm"
 * @throws Error if minutes value is invalid
 */
export function minutesToTimeString(totalMinutes: number): string {
  // Validate that input is a positive integer
  if (!Number.isInteger(totalMinutes) || totalMinutes < 0) {
    throw new Error('Minutes must be a positive integer');
  }

  // Handle overflow by wrapping around to next day
  const normalizedMinutes = totalMinutes % 1440;

  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  // Pad with leading zeros to ensure HH:mm format
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');

  return `${hoursStr}:${minutesStr}`;
}

