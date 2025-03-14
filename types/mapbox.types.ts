export type MapboxSearchResult = {
  id: string;
  type: "Feature";
  place_type: string[];
  properties: {
    name: string;
    description?: string;
    address?: string;
    category?: string;
    rating?: number;
    userRatingCount?: number;
    mapbox_id?: string;
    photos?: {
      prefix: string;
      suffix: string;
    }[];
    openingHours?: {
      periods: Array<{
        open: { day: number; time: string };
        close: { day: number; time: string };
      }>;
      weekdayText: string[];
    };
  };
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  context?: Array<{
    id: string;
    text: string;
    wikidata?: string;
    short_code?: string;
  }>;
};

export type MapboxSearchResponse = {
  type: "FeatureCollection";
  features: MapboxSearchResult[];
  attribution: string;
};

// Helper type for converting Google Places to Mapbox format
export type MapboxPlace = MapboxSearchResult & {
  placeId?: string;
  formattedAddress?: string;
  editorialSummary?: string;
  coverPhoto?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  website?: string;
  phone?: string;
  features?: {
    payment?: any;
    food_and_drink?: any;
    services?: any;
    amenities?: any;
    attributes?: any;
  };
  regularOpeningHours?: {
    weekdayDescriptions: string[];
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
};

export type MapboxCategory = {
  canonical_id: string;
  icon: string;
  name: string;
  version: string;
  uuid: string;
};
