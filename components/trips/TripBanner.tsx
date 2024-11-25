import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import { EditDialog } from "@/components/trips/EditDialog";

type TripBannerProps = {
  coverImage: string;
  title: string;
  location: string;
  username: string;
  duration: number;
  isOwner?: boolean;
};

const TripBanner = ({
  coverImage,
  title: initialTitle,
  location,
  username,
  duration,
  isOwner = false,
}: TripBannerProps) => {
  const [editType, setEditType] = useState<"title" | "image" | null>(null);
  const { coverPhoto, setCoverPhoto, title, setTitle } = useTripEditorStore();

  const handleUpdate = (newValue: string, creditName?: string, creditLink?: string) => {
    if (editType === "title") {
      setTitle(newValue);
    } else if (editType === "image") {
      setCoverPhoto(newValue, creditName, creditLink);
    }
  };

  const displayedImage = coverPhoto || coverImage;
  const displayedTitle = title || initialTitle;

  return (
    <>
      <div className="relative overflow-hidden h-screen max-h-[80vh] rounded-b-2xl">
        <Image
          src={displayedImage}
          alt={displayedTitle}
          fill
          className="rounded-[inherit] object-cover object-center rounded-b-2xl"
        />
        <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-b from-neutral-100 to-neutral-900 opacity-20" />

        {isOwner && (
          <div className="absolute top-4 left-4 flex gap-2">
            <Button
              onClick={() => setEditType("image")}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full"
              size="icon"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="absolute inset-x-6 bottom-[82px] text-center text-white duration-1000 animate-in fade-in slide-in-from-bottom-4">
        <div className="relative">
          <div className="flex items-center justify-center gap-2">
            <h1 className="max-w-5xl text-balance text-5xl font-semibold text-center">
              {displayedTitle}
            </h1>
            {isOwner && (
              <Button
                onClick={() => setEditType("title")}
                className="bg-black/50 hover:bg-black/70 text-white rounded-full flex-shrink-0"
                size="icon"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#feffff"
                  viewBox="0 0 256 256"
                >
                  <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H216a8,8,0,0,0,0-16H115.32l112-112A16,16,0,0,0,227.32,73.37ZM136,75.31,152.69,92,68,176.69,51.31,160ZM48,208V179.31L76.69,208Zm48-3.31L79.32,188,164,103.31,180.69,120Zm96-96L147.32,64l24-24L216,84.69Z"></path>
                </svg>
              </Button>
            )}
          </div>
        </div>
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

      <EditDialog
        open={editType !== null}
        onOpenChange={(open) => setEditType(open ? editType : null)}
        type={editType || "title"}
        initialValue={editType === "title" ? displayedTitle : displayedImage}
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default TripBanner;
