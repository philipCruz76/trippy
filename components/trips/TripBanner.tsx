import Image from "next/image";

type TripBannerProps = {
  coverImage: string;
  title: string;
  location: string;
  username:  string;
  duration: number;
};

const TripBanner = ({ coverImage, title, location, username, duration }: TripBannerProps) => {
  return (
    <>
      <div className="relative overflow-hidden h-screen max-h-[80vh] rounded-b-2xl">
        <Image
          src={coverImage}
          alt={title}
          fill
          className="rounded-[inherit] object-cover object-center rounded-b-2xl"
        />
        <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-b from-neutral-100 to-neutral-900 opacity-20" />
      </div>

      <div className="absolute inset-x-6 bottom-[82px] text-center text-white duration-1000 animate-in fade-in slide-in-from-bottom-4">
        <h1 className="mx-auto max-w-5xl text-balance text-5xl font-semibold">
          {title}
        </h1>
        <div className="mt-4 flex items-center justify-center gap-2.5 text-md font-medium">
          <span className="relative flex shrink-0 overflow-hidden rounded-full font-medium size-[--avatar-size-xs] text-2xs">
            <Image
              className="aspect-square size-full"
              src={"/chat-with-ai.svg"}
              alt={`${username}'s photo`}
              width={16}
              height={16}
            />
          </span>
          <span className="flex items-center gap-[.0625em]">
            <span className="truncate">{username}</span>
          </span>
          <div className="shrink-0 w-px h-[1em] bg-white" />
          <span>{duration} days</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-1">
          
          {location}
        </div>
      </div>
    </>
  );
};

export default TripBanner; 