"use client";

import { useRef } from "react";
import TripBanner from "@/components/trips/TripBanner";
import TripNavigation from "@/components/trips/TripNavigation";
import TripOverview from "@/components/trips/TripOverview";
import TripItinerary from "@/components/trips/TripItinerary";
import TripLocations from "@/components/trips/TripLocations";
import { TripDetails } from "@/types/trip.types";

type TripDetailsClientProps = {
  initialData: TripDetails;
};

export default function TripDetailsClient({ initialData }: TripDetailsClientProps) {
  const overviewRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);

  const scrollIntoView = (scrollTo: string) => {
    const refMap = {
      Overview: overviewRef,
      Itinerary: itineraryRef,
      Locations: locationsRef,
    } as const;
    
    const ref = refMap[scrollTo as keyof typeof refMap];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };
 const placesIds = initialData.itinerary.dailyTrip.flatMap(day => day.locations.map(location => location.place_id))
  return (
    <div className="flex flex-col min-h-[100dvh] px-container pt-16">
      <TripBanner
        coverImage={initialData.coverPhoto}
        title={initialData.title}
        location={initialData.location}
        username={initialData.username}
        duration={initialData.duration}
      />

      <div className="mx-auto w-full max-w-5xl min-h-[120dvh]">
        <TripNavigation onNavigate={scrollIntoView} activeSection="Overview" />
        
        <div ref={overviewRef}>
          <TripOverview overview={initialData.overview} />
        </div>

        <div ref={itineraryRef}>
          <TripItinerary itinerary={initialData.itinerary} />
        </div>

        <div ref={locationsRef}>
          <TripLocations  placesIds ={placesIds}/>
        </div>
      </div>
    </div>
  );
}
