"use client";
import GoogleMapsViewer from "@/components/maps/GoogleMapsViewer";
import MapsProvider from "@/components/maps/MapsProvider";
import Image from "next/image";
import { useRef } from "react";

type pageProps = {};

const page = ({}: pageProps) => {
  const overViewRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);

  const scrollIntoView = (scrollTo: string) => {
    switch (scrollTo) {
      case "Overview":
        overViewRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "Itinerary":
        itineraryRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "Locations":
        locationsRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        return;
    }
  };
  return (
    <div className="flex flex-col min-h-[100dvh] px-container pt-16">
      <>
        {/* Image Banner */}
        <div className="relative overflow-hidden h-screen max-h-[80vh] rounded-b-2xl">
          <Image
            src={"/images/lisbon-tram.jpg"}
            alt="Lisbon trip"
            fill
            className="rounded-[inherit] object-cover object-center rounded-b-2xl"
          />
          <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-b from-neutral-100 to-neutral-900 opacity-20" />
        </div>

        <div className="absolute inset-x-6 bottom-[82px] text-center text-white duration-1000 animate-in fade-in slide-in-from-bottom-4">
          <h1 className="mx-auto max-w-5xl text-balance text-5xl font-semibold">
            Lisbon Trip in 10 days
          </h1>
          {/* User data */}
          <div className="mt-4 flex items-center justify-center gap-2.5 text-md font-medium">
            <span className="relative flex shrink-0 overflow-hidden rounded-full font-medium size-[--avatar-size-xs] text-2xs">
              <Image
                className="aspect-square size-full"
                src={"/chat-with-ai.svg"}
                alt="user photo"
                width={16}
                height={16}
              />
            </span>
            <span className="flex items-center gap-[.0625em]">
              <span className="truncate">neoOng</span>
            </span>
            <div className="shrink-0 w-px h-[1em] bg-white" />
            <span>5 days</span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="#fff"
              viewBox="0 0 256 256"
              className="shrink-0 transform-cpu"
            >
              <path d="M200,224H150.54A266.56,266.56,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25a88,88,0,0,0-176,0c0,31.4,14.51,64.68,42,96.25A266.56,266.56,0,0,0,105.46,224H56a8,8,0,0,0,0,16H200a8,8,0,0,0,0-16ZM56,104a72,72,0,0,1,144,0c0,57.23-55.47,105-72,118C111.47,209,56,161.23,56,104Zm112,0a40,40,0,1,0-40,40A40,40,0,0,0,168,104Zm-64,0a24,24,0,1,1,24,24A24,24,0,0,1,104,104Z" />
            </svg>
            Lisbon, Portugal
          </div>
        </div>
      </>

      {/* Trip Details */}
      <div className="mx-auto w-full max-w-5xl min-h-[120dvh]">
        {/*  */}
        <div className="sticky z-50 overflow-hidden h-[48px] top-[64px] bg-white mx-[calc(var(--sheet-pad)*-1)]">
          <div className="scrollbar-hide flex h-full overflow-x-scroll bg-white scroll-smooth">
            <ul className="flex shrink-0 grow items-end gap-1.5 border-b border-separator sm:gap-2.5 font-normal">
              <li>
                <button
                  onClick={() => scrollIntoView("Overview")}
                  className="-mb-px block border-b-2 px-2 py-1.5 hover:text-foreground border-current text-foreground"
                >
                  <span>Overview</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollIntoView("Itinerary")}
                  className="-mb-px text-zinc-400 block border-b-2 border-transparent px-2 py-1.5 text-muted hover:text-foreground"
                >
                  <span>Itinerary</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollIntoView("Locations")}
                  className="-mb-px text-zinc-400 block border-b-2 border-transparent px-2 py-1.5 text-muted hover:text-foreground"
                >
                  <span>Locations</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Overview */}
        <div
          id="overview"
          ref={overViewRef}
          className="py-9 border-t border-separator scroll-mt-[80px]"
        >
          <div className="relative z-0">
            <div className="flex-wrap items-start gap-7 flex">
              <div className="flex-1">
                <p className="text-pretty leading-relaxed">
                  Get ready to embark on an unforgettable journey through the
                  vibrant and eclectic cityscape of Lisbon. This curated list of
                  must-visit spots is your passport to an urban adventure filled
                  with chic cafes, avant-garde art, and hidden culinary gems.
                </p>
                <div className="shrink-0 bg-separator h-px w-full my-9" />
                <h3 className="mb-6 text-2xl font-semibold leading-tight">
                  Places and Experiences
                </h3>
                <ul className="grid grid-cols-2">
                  <li>
                    <button className="group group/button relative z-0 border border-transparent inline-flex justify-center items-center rounded-full font-medium outline-none disabled:pointer-events-none disabled:opacity-50 transition-colors text-center py-[.25em] text-balance bg-transparent hover:bg-foreground/5 data-[state=open]:bg-foreground/5 data-[state=active]:border-current min-h-[--button-md-size] px-[--button-md-px] -ml-3 gap-2 pl-3 pr-3.5 text-base capitalize">
                      <span className="contents">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#00000"
                          viewBox="0 0 256 256"
                          className="shrink-0 transform-cpu"
                        >
                          <path d="M200,224H150.54A266.56,266.56,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25a88,88,0,0,0-176,0c0,31.4,14.51,64.68,42,96.25A266.56,266.56,0,0,0,105.46,224H56a8,8,0,0,0,0,16H200a8,8,0,0,0,0-16ZM56,104a72,72,0,0,1,144,0c0,57.23-55.47,105-72,118C111.47,209,56,161.23,56,104Zm112,0a40,40,0,1,0-40,40A40,40,0,0,0,168,104Zm-64,0a24,24,0,1,1,24,24A24,24,0,0,1,104,104Z" />
                        </svg>
                        1 city
                      </span>
                    </button>
                  </li>
                  <li>
                    <button className="group group/button relative z-0 border border-transparent inline-flex justify-center items-center rounded-full font-medium outline-none disabled:pointer-events-none disabled:opacity-50 transition-colors text-center py-[.25em] text-balance bg-transparent hover:bg-foreground/5 data-[state=open]:bg-foreground/5 data-[state=active]:border-current min-h-[--button-md-size] px-[--button-md-px] -ml-3 gap-2 pl-3 pr-3.5 text-base capitalize">
                      <span className="contents">
                        <svg
                          className="shrink-0 transform-cpu"
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#000000"
                          viewBox="0 0 256 256"
                        >
                          <path d="M72,88V40a8,8,0,0,1,16,0V88a8,8,0,0,1-16,0ZM216,40V224a8,8,0,0,1-16,0V176H152a8,8,0,0,1-8-8,268.75,268.75,0,0,1,7.22-56.88c9.78-40.49,28.32-67.63,53.63-78.47A8,8,0,0,1,216,40ZM200,53.9c-32.17,24.57-38.47,84.42-39.7,106.1H200ZM119.89,38.69a8,8,0,1,0-15.78,2.63L112,88.63a32,32,0,0,1-64,0l7.88-47.31a8,8,0,1,0-15.78-2.63l-8,48A8.17,8.17,0,0,0,32,88a48.07,48.07,0,0,0,40,47.32V224a8,8,0,0,0,16,0V135.32A48.07,48.07,0,0,0,128,88a8.17,8.17,0,0,0-.11-1.31Z"></path>
                        </svg>
                        6 Restaurant
                      </span>
                    </button>
                  </li>
                  <li>
                    <button className="group group/button relative z-0 border border-transparent inline-flex justify-center items-center rounded-full font-medium outline-none disabled:pointer-events-none disabled:opacity-50 transition-colors text-center py-[.25em] text-balance bg-transparent hover:bg-foreground/5 data-[state=open]:bg-foreground/5 data-[state=active]:border-current min-h-[--button-md-size] px-[--button-md-px] -ml-3 gap-2 pl-3 pr-3.5 text-base capitalize">
                      <span className="contents">
                        <svg
                          className="shrink-0 transform-cpu"
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#000000"
                          viewBox="0 0 256 256"
                        >
                          <path d="M232,224H208V32h8a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16h8V224H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM64,32H192V224H160V184a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v40H64Zm80,192H112V192h32ZM88,64a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,64Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,64ZM88,104a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,104Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,104ZM88,144a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,144Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,144Z"></path>
                        </svg>
                        1 Hotel
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div
          id="locations"
          ref={itineraryRef}
          className="py-9 border-t border-separator scroll-mt-[80px]"
        >
          <h3 className="mb-3 text-4xl font-semibold text-center leading-tight">
            Itinerary
          </h3>
          <p className="text-center"> 10 days</p>

          <ul className="flex flex-col gap-20">
            <li className="flex flex-col gap-9">
              {/* Heading */}
              <div>
                <div className="mb-2.5 flex items-center">
                  <h3 className="text-3xl font-semibold"> Day 1</h3>
                </div>
                <div className="flex">
                  <h4 className="text-pretty text-lg font-medium">
                    {" "}
                    Arrival and relaxation
                  </h4>
                </div>
              </div>
              <div>
                <div className="grid items-start grid-cols-2 gap-9">
                  <div className="top-[calc(var(--header-height)*2+theme(space.4))] sticky">
                    <div className="relative overflow-hidden group rounded-2xl aspect-auto h-[31.25rem]">
                      <Image
                        src={"/images/stock-photos/alrgarve-stock.jpg"}
                        fill
                        alt="Algarve Stock photo"
                      />
                    </div>
                  </div>
                  <div className="col-start-2">
                    <div className="shrink-0 bg-separator h-px w-full mb-6 block" />
                    <div className="mb-2 flex items-start gap-2.5">
                      <h4 className="flex-1 text-pretty text-xl font-semibold @2xl/detail:text-2xl">
                        <span className="underline-offset-2 hover:underline">
                          Algarve{" "}
                        </span>
                      </h4>
                    </div>
                    <div className="flex gap-1 leading-tight mb-2 text-muted items-center justify-start">
                      <svg
                        className="shrink-0 transform-cpu"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="#000000"
                        viewBox="0 0 256 256"
                      >
                        <path d="M240,208h-8V88a8,8,0,0,0-8-8H160a8,8,0,0,0-8,8v40H104V40a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM168,96h48V208H168Zm-16,48v64H104V144ZM40,48H88V208H40ZM72,72V88a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm0,48v16a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm0,48v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm48,16V168a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Zm64,0V168a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Zm0-48V120a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Z"></path>
                      </svg>
                      <span className="capitalize text-gray-500 text-sm h-full">
                        location
                      </span>
                    </div>
                    <p>10:00 AM</p>
                    <div className="shrink-0 bg-separator h-px w-full my-5 @lg:my-6" />
                    <div className="text-pretty pb-9 leading-relaxed">
                      <p>
                        Just a short drive from Lagos, time seems to pass a
                        little slower in the small fishing village of Burgau.
                        Whitewashed houses, colourful doors and bougainvillea
                        flowers make it the picture perfect vacation background.
                        Some even call Burgau the "Santorini of the Algarve"
                        with the white and blue houses giving a close
                        resemblance to the famous Greek island. But thankfully,
                        even with its recent popularity, Burgau still remains an
                        authentic, quiet village with a gorgeous beach that is
                        loved by locals. Stop for a cup of coffee at the cosy
                        Love Burgau or grab a cold gelado on a hot day from the
                        iconic pink window at Brizze Ice Cream shop.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Locations */}
        <div
          id="locations"
          ref={locationsRef}
          className="py-9 border-t border-separator scroll-mt-[80px]"
        >
          <h3 className="mb-3 text-2xl font-semibold leading-tight">
            Locations
          </h3>

          {/* Map API */}
          <MapsProvider>
            <GoogleMapsViewer />
          </MapsProvider>
        </div>
      </div>
    </div>
  );
};

export default page;
