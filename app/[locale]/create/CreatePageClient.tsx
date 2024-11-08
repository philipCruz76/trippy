"use client";

import TripEditor from "@/components/itinerary/TripEditor";
import { useSignInModalStore } from "@/lib/stores/signin-modal-store";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";

/**
 * Client-side component for the create trip page
 * Handles user interaction for creating new trips and signing in
 */
export const CreatePageClient = () => {
  const { setShowModal } = useSignInModalStore();
  const { setShowEditor } = useTripEditorStore();
  
  return (
    <div className="mx-auto w-full max-w-[100dvw] px-8 flex flex-1 flex-row py-[84px] mobile:pt-9">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="flex flex-col gap-10 mt-8 tablet:grid tablet:grid-cols-2 tablet:items-center desktop:gap-16">
          {/* Hero Section */}
          <div className="gap-2">
            <h1 className="mb-[.25em] text-6xl font-bold tracking-tight sm:text-7xl">
              Create. <br />
              Share.
              <br /> Earn.
            </h1>
            <p className="text-pretty sm:max-w-[30em] sm:text-lg">
              Create and share your plans for the perfect holiday trip
            </p>
            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="group group/button relative z-0 border border-transparent inline-flex justify-center items-center rounded-full font-medium outline-none gap-[.3em] disabled:pointer-events-none transition-colors text-center py-[.25em] text-balance bg-primary text-primary-foreground hover:bg-black/80 data-[state=open]:bg-primary-hover disabled:opacity-30 text-md min-h-[55px] px-4 leading-[1.125]"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-start w-[50dvw]">
        <button
          onClick={() => setShowEditor(true)}
          className="group group/button relative z-0 border border-transparent inline-flex justify-center items-center rounded-full font-medium outline-none gap-[.3em] disabled:pointer-events-none transition-colors text-center py-[.25em] text-balance bg-primary text-primary-foreground hover:bg-black/80 data-[state=open]:bg-primary-hover disabled:opacity-30 text-md min-h-[55px] px-4 leading-[1.125]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            className="fill-white group-hover:animate-pulse"
            viewBox="0 0 256 256"
          >
            <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-48-56a8,8,0,0,1-8,8H136v16a8,8,0,0,1-16,0V160H104a8,8,0,0,1,0-16h16V128a8,8,0,0,1,16,0v16h16A8,8,0,0,1,160,152Z"></path>
          </svg>
          Make a new Trip
        </button>
      </div>
      <TripEditor />
    </div>
  );
}; 