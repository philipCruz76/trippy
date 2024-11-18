import { ACTIVITY_TYPE_ICONS } from "@/constants/activity-icons";
import { MARKER_ICONS } from "@/constants/marker-icons";

/**
 * Selects the appropriate SVG icon for a map marker based on its mask URI
 */
export const markerSVGSelector = (svgMaskURI: string | null | undefined) => {
  if (!svgMaskURI) return { src: MARKER_ICONS.generic, alt: "marker" };
  
  const URIlower = svgMaskURI.toLowerCase();
  const iconEntry = Object.entries(MARKER_ICONS)
    .find(([key]) => URIlower.includes(key));
  
  return {
    src: iconEntry?.[1] ?? URIlower,
    alt: iconEntry?.[0] ?? 'marker'
  };
}; 


/**
 * Selects the appropriate icon for an activity type
 */
export const activityTypeIconSelector = (type: string) => {
  if (!type) return { src: '/icons/activity.svg', alt: 'activity' };
  
  const typeLower = type.toLowerCase();
  const iconEntry = Object.entries(ACTIVITY_TYPE_ICONS)
    .find(([key]) => typeLower.includes(key));
  
  return {
    src: iconEntry?.[1] ?? '/icons/activity.svg',
    alt: iconEntry?.[0] ?? 'activity'
  };
};