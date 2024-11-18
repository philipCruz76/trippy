import { activityTypeIconSelector } from "@/lib/utils/map-utils";
import { TripDetails } from "@/types/trip.types";
import Image from "next/image";

type TripOverviewProps = {
  overview: TripDetails["overview"];
};

const TripOverview = ({ overview }: TripOverviewProps) => {
  return (
    <div className="py-9 border-t border-separator scroll-mt-[80px] max-w-[1200px] mx-auto px-4">
      <div className="relative z-0">
        <div className="flex-wrap items-start gap-7 flex">
          <div className="flex-1">
            <p className="text-pretty leading-relaxed text-base text-gray-800 max-w-prose">
              {overview.summary}
            </p>
            <div className="shrink-0 bg-gradient-to-r from-transparent via-separator to-transparent h-px w-full my-9" />
            <h3 className="mb-6 text-2xl font-semibold leading-tight text-gray-900 tracking-tight">
              Places and Experiences
            </h3>
            <ul className="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3 gap-4">
              {overview.activityTypes.map((activityMap, index) => {
                const activityName = Object.keys(activityMap)[0];
                const activityCount = Object.values(activityMap)[0];
                return (
                <li key={index}>
                  <span className="group relative z-0 inline-flex justify-center items-center rounded-full font-medium outline-none transition-all duration-200 text-center py-2 px-4 text-balance bg-transparent hover:scale-105 active:scale-95 min-h-[--button-md-size] gap-2 text-base capitalize">
                    <span className="contents">
                      <Image 
                        {...activityTypeIconSelector(activityName)}
                        width={20}
                        height={20}
                        className="shrink-0 transform-cpu group-hover:scale-110 transition-transform duration-200"
                      />
                       {activityName} ({activityCount})
                    </span>
                  </span>
                </li>
              )})}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripOverview;
