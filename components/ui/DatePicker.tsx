"use client";

import { format, differenceInCalendarDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { useTripCreatorStore } from "@/lib/stores/create-trip-store";
import { useEffect, useState } from "react";

type DatePickerProps = {
  singleMode?: boolean;
};
export function DatePicker({
  className,
  singleMode,
}: React.HTMLAttributes<HTMLDivElement> & DatePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(Date.now()),
  });
  const [singleDate, setSingleDate] = useState<Date | undefined>(
    new Date(Date.now()),
  );
  const [open, setOpen] = useState<boolean>(false);
  const { setDuration } = useTripCreatorStore();

  useEffect(() => {
    if (date === undefined) return;
    const newDuration = differenceInCalendarDays(date.to!, date.from!) + 1;

    setDuration(newDuration);
  }, [date]);
  return (
    <div className={cn("grid gap-2")}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(className, !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {singleMode ? (
              format(singleDate!, "LLL dd")
            ) : date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
                </>
              ) : (
                format(date.from, "LLL dd")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "inner pointer-events-auto  flex transform-gpu flex-col rounded-t-2xl border-separator bg-background shadow-xl outline-none !duration-drawer ease-drawer mobile:rounded-2xl mobile:!duration-dialog mobile:ease-in-out dark:mobile:border",
            singleMode ? "w-fit" : "min-w-[60dvw]",
          )}
        >
          <div className="">
            <div className="flex-none text-balance text-center">
              <h2 className="line-clamp-2 font-semibold text-lg mobile:text-xl">
                When
              </h2>
              <p className="mt-1 text-pretty text-xs text-center">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd")} -{" "}
                      {format(date.to, "LLL dd")}
                    </>
                  ) : (
                    format(date.from, "LLL dd")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
                <span className="mx-1.5">.</span>
                <span>
                  {date?.from && date.to
                    ? differenceInCalendarDays(date.to, date.from) + 1
                    : null}{" "}
                  days
                </span>
              </p>
            </div>
            {singleMode ? (
              <Calendar
                initialFocus
                mode="single"
                defaultMonth={singleDate}
                selected={singleDate}
                onSelect={setSingleDate}
                numberOfMonths={1}
                onDayClick={() => {
                  setOpen(false);
                }}
              />
            ) : (
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
