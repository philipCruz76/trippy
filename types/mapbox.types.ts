export type MapboxSearchResult = {
    id: string;
    type: 'Feature';
    place_type: string[];
    properties: {
      name: string;
      description?: string;
      address?: string;
      category?: string;
      rating?: number;
      userRatingCount?: number;
      mapbox_id?: string;
      photos?: string[];
      openingHours?: {
        periods: Array<{
          open: { day: number; time: string };
          close: { day: number; time: string };
        }>;
        weekdayText: string[];
      };
    };
    geometry: {
      type: 'Point';
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
    type: 'FeatureCollection';
    features: MapboxSearchResult[];
    attribution: string;
  };
  
  // Helper type for converting Google Places to Mapbox format
  export type MapboxPlace = MapboxSearchResult & {
    placeId?: string;
    formattedAddress?: string;
    editorialSummary?: string;
    regularOpeningHours?: {
      weekdayDescriptions: string[];
      periods: Array<{
        open: { day: number; time: string };
        close: { day: number; time: string };
      }>;
    };
  };