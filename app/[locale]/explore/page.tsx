import { Input } from "@/components/ui/input";
import TripCard from "@/components/trips/TripCard";
import { unstable_setRequestLocale } from "next-intl/server";
import getTrips from "@/lib/actions/trips/getTrips";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type pageProps = {};

const page = async ({ params: { locale } }: { params: { locale: string } }) => {
  unstable_setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Get trips and filter for published ones or user's own trips
  const trips = await getTrips();

  if (!trips)
    return (
      <div className="flex flex-col gap-8 p-24 max-w-[100dvw] min-h-[100dvh] overflow-hidden">
        <h1 className="text-4xl text-start font-semibold text-black">
          Explore
        </h1>
        <Input
          type="search"
          placeholder="Search for your next destination..."
          className="w-[50%] rounded-2xl bg-gray-100 focus:bg-white"
        />
        <div>No trips found</div>
      </div>
    );

  const filteredTrips = trips.filter(
    (trip) => trip.published || trip.userId === userId,
  );

  return (
    <div className="flex flex-col gap-8 desktop:p-24 p-6 pt-24 max-w-[100dvw] min-h-[100dvh] overflow-hidden">
      <h1 className="text-4xl text-start font-semibold text-black">Explore</h1>
      <Input
        type="search"
        placeholder="Search for your next destination..."
        className="w-[80&] tablet:w-[75%] desktop:w-[50%] rounded-2xl bg-gray-100 focus:bg-white"
      />
      {/* Location Cards */}
      {filteredTrips && filteredTrips.length > 0 ? (
        <ul className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 auto-rows-auto">
          {filteredTrips.map((trip, index) => {
            return (
              <li key={index} className="cursor-pointer max-w-fit">
                <TripCard tripData={trip} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div>No trips found</div>
      )}
    </div>
  );
};

export default page;
