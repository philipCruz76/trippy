import { Suspense } from "react";
import TripDetailsClient from "./TripDetailsClient";
import { getTripDetails } from "@/lib/actions/trips/getTripDetails";
import TripDetailsSkeleton from "./TripDetailsSkeleton";
import { redirect } from "next/navigation";

export default async function TripDetailsPage({ 
  params 
}: { 
  params: { tripId: string } 
}) {
  // Fetch trip details on the server
  const tripDetails = await getTripDetails(params.tripId);
  
  if (!tripDetails) {
    redirect("/explore");
  }

  return (
    <Suspense fallback={<TripDetailsSkeleton />}>
      <TripDetailsClient initialData={tripDetails} />
    </Suspense>
  );
}
