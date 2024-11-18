import { Input } from "@/components/ui/input";
import TripCard from "@/components/trips/TripCard";
import { unstable_setRequestLocale } from "next-intl/server";
import getTrips from "@/lib/actions/trips/getTrips";

type pageProps = {};

const page = async ({ params: { locale } }: { params: { locale: string } }) => {
  unstable_setRequestLocale(locale);

  const trips = await getTrips();
  return (
    <div className="flex flex-col gap-8 p-24 max-w-[100dvw] min-h-[100dvh] overflow-hidden">
      <h1 className="text-4xl text-start font-semibold text-black">Explore</h1>
      <Input
        type="search"
        placeholder="Search for your next destination..."
        className="w-[50%] rounded-2xl bg-gray-100 focus:bg-white"
      />
      {/* Location Cards */}
      {trips && trips.length > 0 ? (
        <ul className="grid grid-cols-3 grid-rows-3 gap-6">
          {trips.map((trip, index) => {
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
