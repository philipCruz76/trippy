"use client";

import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import getDestinationData from "@/lib/actions/getDestinationData";
import { Destinations } from "@/types/prisma.types";

type DestinationSelectorProps = {
  editField: boolean;
  setEditField: Dispatch<SetStateAction<boolean>>;
  setLocation: (location: string) => void;
};

const DestinationSelector = ({
  editField,
  setLocation,
  setEditField,
}: DestinationSelectorProps) => {
  const [tempLocation, setTempLocation] = useState("");
  const [destinationResults, setDestinationResults] = useState<Destinations>();
  const [filteredResults, setFilteredResults] = useState<Destinations>();
  const searchResults = useDebouncedCallback(async (query: string) => {
    if (destinationResults !== undefined) {
      const result = destinationResults.filter((destination) =>
        destination.city!.toLowerCase().startsWith(query.toLowerCase()),
      );
      setFilteredResults(result);
    } else {
      return;
    }
  }, 500);

  useEffect(() => {
    const loadDestinationData = async () => {
      const data = await getDestinationData();
      setDestinationResults(data);
    };
    loadDestinationData();
  }, []);
  return (
    <Dialog
      open={editField}
      modal
      onOpenChange={(prev) => {
        setEditField(prev);
      }}
    >
      <DialogPortal>
        <DialogClose className="w-[24px] h-[24px]" />
        <DialogOverlay className="bg-black/80"/>
        <DialogContent className="inner pointer-events-auto relative bottom-[25dvh] flex w-full transform-gpu flex-col max-h-[420px] rounded-t-2xl border-separator bg-background shadow-xl outline-none overflow-x-hidden overflow-y-hidden !duration-drawer ease-drawer mobile:rounded-2xl mobile:!duration-dialog mobile:ease-in-out">
          <DialogTitle>Where</DialogTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            role="search"
          >
            <Input
              type="search"
              onChange={(e) => {
                const location = e.target.value;
                setTempLocation(location);
                if (location !== "") searchResults(location);
              }}
              value={tempLocation}
            />
            {Array.isArray(filteredResults) && filteredResults.length > 0 ? (
              <div className="relative mt-9 flex flex-col max-h-[220px] overflow-y-scroll gap-4">
                {filteredResults.map((destination) => (
                  <div
                    onClick={() => {
                      setTempLocation(destination.city!);
                    }}
                    className="flex flex-row justify-start cursor-pointer items-center gap-2 hover:bg-gray-200 rounded-xl p-2"
                  >
                    <Image
                      src={destination.photo!}
                      alt={destination.city!}
                      width={64}
                      height={64}
                      className="rounded-2xl overflow-hidden min-h-[64px] min-w-[64px] max-h-[64px] max-w-[64px]"
                    />
                    <div className="min-w-0 flex-1 flex flex-col leading-tight">
                      <span className="mb-0.5 truncate text-md font-semibold">
                        {destination.city}
                      </span>
                      <span className="capitalize">{destination.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div>
              <div className="flex shrink-0 flex-col-reverse gap-2 mobile:flex-row mobile:justify-end pt-4" />
              <button
                type="submit"
                onClick={() => {
                  if (tempLocation === "") return;
                  const match = filteredResults?.filter(
                    (result) => result.city === tempLocation,
                  );
                  if (
                    match !== undefined &&
                    match.length > 0 &&
                    match[0].city === tempLocation
                  ) {
                    setLocation(tempLocation);
                    setEditField(false);
                  } else {
                    return;
                  }
                }}
                className="group group/button bg-black relative z-0 border border-transparent justify-center items-center rounded-full font-normal outline-none gap-[.3em] disabled:pointer-events-none transition-colors text-center py-[.25em] text-balance bg-primary text-primary-foreground hover:bg-black/80 disabled:opacity-30 text-sm min-h-[40px] leading-[1.125] flex w-full"
              >
                Update
              </button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DestinationSelector;
