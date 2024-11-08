import { Input } from "@/components/ui/input";
import TripCard from "@/components/trips/TripCard";
import { unstable_setRequestLocale } from 'next-intl/server';

type pageProps = {};

const tempSlides = [
  "/images/lisbon-tram.jpg",
  "/images/lisbon-photo.jpg",
  "/images/lisbon-bg.jpg",
];

const page = ({ params: { locale } }: { params: { locale: string } }) => {
  unstable_setRequestLocale(locale);

  const cards = Array(1).fill(1);

  return (
    <div className="flex flex-col gap-8 p-24 max-w-[100dvw] min-h-[100dvh] overflow-hidden">
      <h1 className="text-4xl text-start font-semibold text-black">Explore</h1>
      <Input
        type="search"
        placeholder="Search for your next destination..."
        className="w-[50%] rounded-2xl bg-gray-100 focus:bg-white"
      />
      {/* Location Cards */}
      <ul className="grid grid-cols-3 grid-rows-3 gap-6">
        {cards.map((card, index) => (
          <li key={index} className="cursor-pointer max-w-fit">
            <TripCard tripPhotos={tempSlides} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default page;
