import Image from "next/image";

type HeroExplainerProps = {};

const HeroExplainer = ({}: HeroExplainerProps) => {
  return (
    <div className="flex flex-col gap-12 w-[100dvw] h-[100dvh]">
      {/* How it's Done xplainer */}
      <h1 className="pt-[100px] desktop:text-6xl text-4xl font-bold">
        How it's Done
      </h1>
      <div className="flex flex-row gap-2 justify-center items-center">
        <div className="w-full">
          <Image
            src={"/chat-with-ai.svg"}
            alt="chat-with-ai"
            width={500}
            height={500}
            className="w-[80%] pl-20"
          />
        </div>
        <div className="w-[80%] text-start h-[60%] pr-12">
          <h2 className="w-[400px] font-bold text-5xl">
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

      <div className="flex flex-row gap-2 justify-center items-center">
        <div className="w-[80%] text-start h-[60%] pl-12">
          <h2 className="w-[400px] font-bold text-5xl">
            Get personalized trip itineraries
          </h2>
          <p className="w-full text-ellipsis">
            We’ll provide personalized, actionable travel experiences based on
            your preferences. Check out photos, reviews, maps and more. Favorite
            the items you like and add them to your trip plan.
          </p>
        </div>
        <div className="w-full">
          <Image
            src={"/online-travel-booking.svg"}
            alt="travel-booking"
            width={500}
            height={500}
            className="w-[80%] pr-20"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroExplainer;
