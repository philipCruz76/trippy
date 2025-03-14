export type MultiPointMarker = {
  type: "MultiPoint";
  coordinates: GeoCoordinates[];
};

export type GeoCoordinates = {
  lat: number;
  lng: number;
  type?: MarkerType;
};

export type MarkerType =
  | "Location"
  | "Resturant"
  | "Landmark"
  | "Museum"
  | "Shopping";

export type PlaceType =
  | "amusement_park"
  | "aquarium"
  | "art_gallery"
  | "bakery"
  | "bar"
  | "book_store"
  | "cafe"
  | "church"
  | "clothing_store"
  | "department_store"
  | "library"
  | "light_rail_station"
  | "museum"
  | "night_club"
  | "park"
  | "restaurant"
  | "shoe_store"
  | "shopping_mall"
  | "spa"
  | "stadium"
  | "store"
  | "tourist_attraction";
