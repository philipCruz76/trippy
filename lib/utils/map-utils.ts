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