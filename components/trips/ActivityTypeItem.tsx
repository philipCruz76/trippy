import { memo } from "react";
import Image from "next/image";
import { activityTypeIconSelector } from "@/lib/utils/map-utils";

type ActivityTypeItemProps = {
  activityName: string;
  activityCount: number;
};

const ActivityTypeItem = memo(
  ({ activityName, activityCount }: ActivityTypeItemProps) => {
    return (
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
    );
  },
);

ActivityTypeItem.displayName = "ActivityTypeItem";
export default ActivityTypeItem;
