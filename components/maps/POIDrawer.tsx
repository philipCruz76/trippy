"use client";
import { usePOIDrawerStore } from "@/lib/stores/poi-drawer-store";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import Carousel from "../ui/Carousel";
import { formatNum } from "@/lib/utils";
import { useCachedState } from "@/lib/hooks/useCachedState";

type POIDrawerProps = {
  placeData: google.maps.places.Place;
};

const POIDrawer = ({ placeData }: POIDrawerProps) => {
  const { showDrawer, setShowDrawer } = usePOIDrawerStore();
  // Use the useCachedState hook instead of useState
  const [coverPhotos] = useCachedState("markerPhotos", [""]);

  return (
    <>
      <Drawer
        direction="right"
        open={showDrawer}
        setBackgroundColorOnScale={false}
      >
        <DrawerPortal>
          <DrawerOverlay className="fixed inset-0 z-50 bg-none" />
          <DrawerContent
            onInteractOutside={() => {
              setShowDrawer(false);
            }}
            className="fixed border-gray-300/80 shadow-md rounded-tl-xl rounded-bl-xl right-0 bottom-0 z-50 mt-24 flex min-h-[100dvh] w-[450px] flex-col gap-4 bg-white px-4 py-6"
          >
            {/* POI Photo Section */}
            <div className="h-[300px] w-full">
              <Carousel slides={coverPhotos} size="large" asPhotosOnly />
            </div>

            {/* Place Data */}
            <div className="w-full p-3 flex flex-col h-full">
              <h2 className="flex justify-between text-left font-medium font-sans text-2xl">
                {placeData.displayName}
                <span className="flex flex-row items-center text-base font-normal">
                  {placeData.rating}{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#000000"
                    viewBox="0 0 256 256"
                  >
                    <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"></path>
                  </svg>
                  <span className="text-sm text-gray-400">
                    {"   ("}
                    {!placeData.userRatingCount ? 0: formatNum(placeData.userRatingCount!)}
                    {")"}
                  </span>
                </span>
              </h2>

              <span className="py-4 text-sm">{placeData.editorialSummary}</span>

              <span className="text-sm text-gray-400">
                {placeData.formattedAddress}
              </span>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </>
  );
};

export default POIDrawer;
