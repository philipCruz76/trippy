"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CarouselProps = {
  slides: string[];
  size: "normal" | "large" | "custom";
  customHeight?: string;
  asPhotosOnly?: boolean;
  unsplashPhotos?: boolean;
};


const Carousel = ({
  slides,
  size,
  customHeight,
  asPhotosOnly,
  unsplashPhotos,
}: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const buttonsRef = useRef(null);
  const prev = () =>
    setCurrentSlide((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  const next = () =>
    setCurrentSlide((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    // Check if the clicked element is the button or if the Carousel is in Photos only mode
    if (
      (event.target as HTMLElement).tagName.toLowerCase() !== "div" ||
      asPhotosOnly
    ) {
      event.preventDefault(); // Prevent the redirection
    }
  };

  if(!Array.isArray(slides)) return null;
  return (
    <Card
      className={cn(
        "relative mb-4 aspect-portrait overflow-hidden rounded-2xl",
        size === "custom"
          ? `w-full h-[${customHeight!}px]`
          : size === "normal"
            ? "w-[304px] h-[347px]"
            : "w-full h-full",
      )}
    >
      <CardContent className="absolute inset-0 overflow-hidden text-center content-center rounded-[inherit] object-cover object-center transition-transform ease-out duration-500">
        <Link
          id="trip-link"
          href={"/explore/lisbon"}
          onClick={(e) => handleClick(e)}
          className="min-h-full min-w-full group"
        >
          <Image
            src={`${slides[currentSlide]}`}
            fill
            priority
            alt={`Lisbon Photo-${currentSlide}`}
          />

          <div
            ref={buttonsRef}
            className="absolute inset-0 flex items-center justify-between p-4"
          >
            <button
              onClick={prev}
              className="hidden group-hover:block p-1 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={next}
              className="hidden group-hover:block p-1 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          {unsplashPhotos !== undefined ? (
            <div className="absolute right-4 bottom-[24px] flex gap-2.5">
              <button className="group group/button relative z-0 border border-transparent inline-flex justify-center items-center rounded-full font-medium outline-none gap-[.3em] disabled:pointer-events-none disabled:opacity-50 text-center py-[.25em] text-balance text-2xs min-h-[--button-xs-size] leading-[1.125] px-0 shrink-0 size-[--button-xs-size] transition-transform hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="#feffff"
                  viewBox="0 0 256 256"
                >
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
                </svg>
                <div className="absolute right-4 bottom-[42px]"></div>
              </button>
            </div>
          ) : null}
          {!asPhotosOnly ? (
            <>
              <div className="absolute right-4 top-4 flex gap-2.5">
                <button className="group group/button relative z-0 border border-transparent inline-flex justify-center items-center rounded-full font-medium outline-none gap-[.3em] disabled:pointer-events-none disabled:opacity-50 text-center py-[.25em] text-balance text-2xs min-h-[--button-xs-size] leading-[1.125] px-0 shrink-0 size-[--button-xs-size] transition-transform hover:scale-110">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="#feffff"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M232,102c0,66-104,122-104,122S24,168,24,102A54,54,0,0,1,78,48c22.59,0,41.94,12.31,50,32,8.06-19.69,27.41-32,50-32A54,54,0,0,1,232,102Z"
                      opacity="0.2"
                    ></path>
                    <path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z"></path>
                  </svg>
                </button>
              </div>
              <div className="absolute left-4 top-5 flex gap-2.5">
                <span className="inline-flex items-center font-medium border text-sm whitespace-nowrap shrink-0 rounded-full bg-background/60 text-foreground text-3xs h-4 backdrop-blur-sm leading-none px-[.625em]">
                  {" "}
                  10 Locations
                </span>
              </div>{" "}
            </>
          ) : null}
          <div className="absolute bottom-4 right-0 left-0">
            <div className="flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`
              transition-all w-3 h-3 bg-white rounded-full
              ${currentSlide === i ? "p-2" : "bg-opacity-50"}
            `}
                />
              ))}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default Carousel;
