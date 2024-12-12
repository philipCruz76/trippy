"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CarouselSlide = {
  url: string;
  isLoading: boolean;
  width?: number;
  height?: number;
  component?: React.ReactNode;
};

type CarouselProps = {
  slides: CarouselSlide[];
  size: 'large' | 'normal' | 'custom';
  customHeight?: string;
  asPhotosOnly?: boolean;
  href?: string;
  credit?: boolean;
  photoCreditName?: string | null;
  photoCreditLink?: string | null;
};

const Carousel = ({
  slides,
  size,
  customHeight,
  asPhotosOnly,
  href = "",
  credit,
  photoCreditName,
  photoCreditLink,
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
      (event.target as HTMLElement).tagName.toLowerCase() !== "img" ||
      asPhotosOnly
    ) {
      event.preventDefault(); // Prevent the redirection
    }
  };

  if(!Array.isArray(slides) || slides.length === 0 || !slides[0].url) {
    // Return carousel with not-found image
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
        <CardContent className="absolute inset-0 overflow-hidden text-center content-center rounded-[inherit] object-cover object-center">
          <Image
            src="/not-found.svg"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt="No images found"
          />
        </CardContent>
      </Card>
    );
  }

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
          href={href}
          onClick={(e) => handleClick(e)}
          className="min-h-full min-w-full group"
        >
          <Image
            src={slides[currentSlide].url || "/not-found.svg"}
            fill
            priority
            alt={`Photo-${currentSlide}`}
          />
          {credit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Add your information button click handler here
                    }}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-transparent hover:bg-white/80 transition-colors shadow-md z-10"
                    aria-label="Photo credit information"
                  >
                    <Image
                      src="/icons/information.svg"
                      width={16}
                      height={16}
                      alt="Information"
                      className="w-4 h-4"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-black p-2 rounded-md shadow-md">
                  <p>Photo by{' '}
                    {photoCreditLink ? (
                      <a 
                        href={photoCreditLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {photoCreditName}
                      </a>
                    ) : (
                      <span>{photoCreditName}</span>
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {slides.length > 1 && (
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
          )}
          {slides.length > 1 && (
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
          )}
        </Link>
      </CardContent>
    </Card>
  );
};

export default Carousel;
