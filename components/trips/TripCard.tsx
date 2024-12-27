import Image from "next/image";
import Carousel from "../ui/Carousel";
import { TripDetails } from "@prisma/client";

type TripCardProps = {
  tripData: TripDetails;
};

const TripCard = ({ tripData }: TripCardProps) => {
  const tempSlides = [
    {
      url: tripData.coverPhoto,
      isLoading: false,
      width: undefined,
      height: undefined,
    },
  ];
  return (
    <>
      <Carousel
        slides={tempSlides}
        size="normal"
        href={`/explore/${tripData.id}`}
        credit={tripData.photoCreditName ? true : false}
        photoCreditName={tripData.photoCreditName}
        photoCreditLink={tripData.photoCreditLink}
      />
      <div className="flex flex-col gap-1.5 pt-4 text-sm !leading-tight @[21.375rem]:text-base">
        <h2 className="font-semibold">{tripData.title}</h2>
        <div className="flex gap-1 text-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#C0C0C0"
            aria-label="Like"
            viewBox="0 0 256 256"
            className="shrink-0 transform-cpu"
          >
            <path d="M200,224H150.54A266.56,266.56,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25a88,88,0,0,0-176,0c0,31.4,14.51,64.68,42,96.25A266.56,266.56,0,0,0,105.46,224H56a8,8,0,0,0,0,16H200a8,8,0,0,0,0-16ZM56,104a72,72,0,0,1,144,0c0,57.23-55.47,105-72,118C111.47,209,56,161.23,56,104Zm112,0a40,40,0,1,0-40,40A40,40,0,0,0,168,104Zm-64,0a24,24,0,1,1,24,24A24,24,0,0,1,104,104Z" />
          </svg>
          <span className="text-[#C0C0C0]">{tripData.location}</span>
        </div>
        <div className="flex w-full h-[18px] items-center gap-1 text-muted">
          <Image
            className="relative flex overflow-hidden rounded-full font-medium text-3xs tracking-tight"
            src={"/chat-with-ai.svg"}
            alt="user photo"
            width={16}
            height={16}
          />

          <span className="flex text-[#C0C0C0] items-center gap-[.0625em]">
            <span className="truncate"> {tripData.username}</span>
          </span>
        </div>
      </div>
    </>
  );
};

export default TripCard;
