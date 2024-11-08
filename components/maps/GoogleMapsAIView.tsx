"use client";
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import MapsProvider, { useMapSearch } from "@/components/maps/MapsProvider";
import {
  Map as GoogleMapComponent
} from "@vis.gl/react-google-maps";
import ChatMap from "./ChatMap";

type GoogleMapsAIViewProps = {
  city: LatLngResult;
  searchTypes: {
    includedTypes: string[],
    excludedTypes?: string[],
  };
};

const GoogleMapsAIView = ({ city, searchTypes }: GoogleMapsAIViewProps) => {

  return (
    <MapsProvider searchTypes={searchTypes}>
      <GoogleMapComponent
        id="chat-map"
        style={{ width: "49dvw", height: "88dvh" }}
        mapId={"768edab3237ff37e"}
        defaultCenter={{ lat: city.lat, lng: city.lng }}
        defaultZoom={14}
        gestureHandling={"cooperative"}
      >
        <ChatMap searchTypes={searchTypes} city={city} />
      </GoogleMapComponent>
    </MapsProvider>
  );
};

export default GoogleMapsAIView;
