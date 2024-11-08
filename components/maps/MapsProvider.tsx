import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { ReactNode, createContext, useContext, useState } from "react";

type MapSearchContextType = {
  searchNearby: (location: google.maps.LatLngLiteral) => Promise<google.maps.places.Place[]>;
  searchResults: google.maps.places.Place[];
};

const MapSearchContext = createContext<MapSearchContextType | undefined>(undefined);

export const useMapSearch = () => {
  const context = useContext(MapSearchContext);
  if (!context) {
    throw new Error("useMapSearch must be used within a MapsProvider");
  }
  return context;
};

type MapsProviderProps = {
  children: ReactNode;
  searchTypes?: {
    includedTypes: string[];
    excludedTypes?: string[];
  };
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const MapsProvider = ({ children, searchTypes }: MapsProviderProps) => {
  const [searchResults, setSearchResults] = useState<google.maps.places.Place[]>([]);
  const placesLib = useMapsLibrary("places");

  const searchNearby = async (location: google.maps.LatLngLiteral) => {
    if (!placesLib) return [];

    try {
      const { places } = await placesLib.Place.searchNearby({
        locationRestriction:{
          center:location,
          radius: 5000, // 5km radius
        } as google.maps.CircleLiteral,
        includedTypes: searchTypes?.includedTypes || [],
        excludedTypes: searchTypes?.excludedTypes || [],
        maxResultCount: 20,
        fields: [
          "location",
          "displayName",
          "formattedAddress",
          "photos",
          "rating",
          "svgIconMaskURI",
          "types",
          "userRatingCount",
          "editorialSummary",
          "regularOpeningHours",
        ]
      });
      setSearchResults(places);
      return places;
    } catch (error) {
      console.error("Failed to search nearby places:", error);
      return [];
    }
  };

  return (
    <APIProvider
      version="beta"
      apiKey={API_KEY}
      libraries={["marker", "places"]}
    >
      <MapSearchContext.Provider value={{ searchNearby, searchResults }}>
        {children}
      </MapSearchContext.Provider>
    </APIProvider>
  );
};

export default MapsProvider;
