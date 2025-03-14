import Image from "next/image";

type HeroExplainerProps = {};

const HeroExplainer = ({}: HeroExplainerProps) => {
  return (
    <div className="flex flex-col gap-12 w-[100dvw] h-[100dvh]">
      {/* How it's Done xplainer */}
      <h1 className="pt-[100px] desktop:text-6xl text-4xl font-bold">
        How it's Done
      </h1>
      <div className="flex desktop:flex-row flex-col gap-2 justify-center items-center">
        <Image
          src={"/chat-with-ai.svg"}
          alt="chat-with-ai"
          width={500}
          height={500}
          className="desktop:w-[70%] w-[200px] desktop:pl-20"
        />
        <div className="w-[70%] text-start h-[60%] pr-12">
          <h2 className="min-w-fit truncate font-bold desktop:text-5xl text-3xl desktop:w-[400px]">
            Start chatting with us.
          </h2>
          <p className="w-full text-ellipsis">
            Ask us for suggestions for any destination or ask us for an entire
            itinerary. Be as specific as you can about the types of experiences
            that you like or take our quiz to determine your travel style.
          </p>
        </div>
      </div>

      {/* How it's Done xplainer */}
      <div className="flex desktop:flex-row flex-col-reverse gap-2 justify-center items-center">
        <div className="w-[70%] text-start h-[60%] desktop:pl-12">
          <h2 className="min-w-fit  font-bold desktop:text-5xl text-3xl desktop:min-w-[400px]">
            Get personalized trip itineraries
          </h2>
          <p className="w-full text-ellipsis">
            We’ll provide personalized, actionable travel experiences based on
            your preferences. Check out photos, reviews, maps and more. Favorite
            the items you like and add them to your trip plan.
          </p>
        </div>
        <Image
          src={"/online-travel-booking.svg"}
          alt="travel-booking"
          width={500}
          height={500}
          className="desktop:w-[70%] w-[200px] desktop:pr-20"
        />
      </div>
    </div>
  );
};

export default HeroExplainer;
