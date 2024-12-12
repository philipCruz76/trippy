import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import { ActivityType } from "@/types/trip.types";
import Image from "next/image";
import React from "react";

type ActivityAdditionalProps = {
  dayIdx:number;
  actIdx: number;
  priority?: boolean;
}

const Activity = ({
  cover,
  activityType,
  title,
  manualInput,
  durationFrom,
  durationTo,
  dayIdx,
  actIdx,
  priority
}: ActivityType & ActivityAdditionalProps) => {
  const {removeActivity} = useTripEditorStore();
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageFallback, setImageFallback] = React.useState(false);

  const handleImageError = () => {
    setImageFallback(true);
    setImageLoading(false);
  };

  return (
    <div className="group/item pt-2">
      <div className="group/item relative z-1 overflow-hidden rounded-2xl border border-gray-4 bg-background text-sm transition-colors hover:border-gray-7">
        {" "}
        <div className="group box-content flex min-h-[calc(var(--item-height)-(theme(space[1.5])*2))] select-none items-center gap-2.5 bg-background px-2.5 py-1.5 leading-tight transition-colors cursor-grab hover:bg-gray-100/60">
          {/* Activity cover photo */}
          <div className="flex shrink-0 items-center justify-center overflow-hidden bg-gray-3 pointer-events-none rounded-lg w-[60px] h-[60px]">
            {cover && !imageFallback ? (
              <div className="relative">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  </div>
                )}
                <Image
                  src={cover}
                  alt={title}
                  width={60}
                  height={60}
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  loading={priority ? "eager" : "lazy"}
                  priority={priority}
                  onLoad={() => setImageLoading(false)}
                  onError={handleImageError}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📍</span>
              </div>
            )}
          </div>
          {/* Activity Title */}
          <div className="relative min-w-0 flex-1">
            {manualInput=== true ? (
              <span className="text-xs text-black bg-zinc-200 rounded-2xl px-[6px]">
                Manually Added
              </span>
            ) : null}
            <h3 className="flex items-center gap-1 font-semibold">
              {/* Activity type 
              <Image
                src={activityType}
                width={20}
                height={20}
                alt="place"
                className="shrink-0 transform-cpu size-[1em] text-[1.125em]"
              />
              */}
              {/* Activity Name */}
              <span className="truncate">{title}</span>
            </h3>

            {/* Activtiy Duration */}
            <div className="mt-0.5 text-2xs desktop:text-xs flex flex-row text-gray-400 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="12"
                fill="#000000"
                viewBox="0 0 256 256"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
              </svg>
              <span className="-m-1 p-1 hover:text-foreground">
                {" "}
                {durationFrom}
              </span>
              <span className="mx-1">-</span>
              <span className="-m-1 p-1 hover:text-foreground">
                {durationTo}
              </span>
            </div>
          </div>
          {/* Remove activity */}
          <button  onClick={()=> removeActivity(dayIdx,actIdx)} className="flex w-8 h-8 border items-center group justify-center rounded-xl hover:bg-zinc-300">
            <Image
              src={"/icons/remove.svg"}
              alt="Delete button"
              width={24}
              height={24}
              className="w-[16px] h-[16p] group-hover:scale-110 transition-transform ease-in-out duration-200"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Activity;
