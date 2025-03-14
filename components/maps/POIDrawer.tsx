"use client";
import { usePOIDrawerStore } from "@/lib/stores/poi-drawer-store";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
} from "@/components/ui/drawer";
import Carousel from "../ui/Carousel";
import { usePOIStore } from "@/lib/stores/poi-store";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TripDetails } from "@/types/trip.types";

type POIDrawerProps = {
  placeData: TripDetails["itinerary"]["dailyTrip"][number]["itinerary"][number]["activities"][0];
};

const POIDrawer = ({ placeData }: POIDrawerProps) => {
  const { showDrawer, setShowDrawer } = usePOIDrawerStore();
  const { markerId, setMarkerId } = usePOIStore();
  const [coverPhotos, setCoverPhotos] = useState<
    Array<{
      url: string;
      isLoading: boolean;
      width?: number;
      height?: number;
    }>
  >([]);

  // Preload images and get their dimensions
  const preloadImage = useCallback(async (url: string) => {
    const cache = new Map<string, { width: number; height: number }>();

    if (cache.has(url)) {
      return { url, ...cache.get(url)! };
    }

    return new Promise<{ url: string; width: number; height: number }>(
      (resolve) => {
        const img = document.createElement("img");
        img.onload = () => {
          const dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          cache.set(url, dimensions);
          resolve({ url, ...dimensions });
        };
        img.src = url;
      },
    );
  }, []);

  useEffect(() => {
    if (!placeData.photos) return;

    const loadPhotos = async () => {
      const photos = placeData.photos || [];
      const initialPhotos = photos.map((photo) => ({
        url: photo,
        isLoading: true,
      }));
      setCoverPhotos(initialPhotos);

      const photoPromises = initialPhotos.map(async (photo, index) => {
        try {
          const loadedPhoto = await preloadImage(photo.url);
          setCoverPhotos((prev) =>
            prev.map((p, i) =>
              i === index ? { ...loadedPhoto, isLoading: false } : p,
            ),
          );
          return loadedPhoto;
        } catch (error) {
          console.error(`Failed to load photo ${index}:`, error);
          return null;
        }
      });

      await Promise.all(photoPromises);
    };

    loadPhotos();
  }, [placeData.photos, preloadImage]);

  const isVisible = showDrawer && markerId === placeData.place_id;

  return (
    <Drawer
      direction="right"
      open={isVisible}
      onClose={() => {
        setShowDrawer(false);
        setMarkerId("");
      }}
    >
      <DrawerPortal>
        <DrawerOverlay className="fixed inset-0 z-50 bg-none" />
        <DrawerTitle>{placeData.activityName}</DrawerTitle>
        <DrawerContent
          onInteractOutside={() => {
            setShowDrawer(false);
          }}
          className="fixed border-gray-300/80 shadow-md rounded-tl-xl rounded-bl-xl right-0 bottom-0 z-50 mt-24 flex min-h-[100dvh] w-[450px] flex-col gap-4 bg-white px-4 py-6"
        >
          <div className="h-[300px] w-full">
            <Carousel
              slides={coverPhotos.map((photo) => ({
                ...photo,
                component: (
                  <div className="relative w-full h-full">
                    {photo.isLoading ? (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    ) : (
                      <Image
                        src={photo.url}
                        alt="Place photo"
                        fill
                        sizes="(max-width: 450px) 100vw, 450px"
                        className="object-cover"
                        priority={true}
                        loading="eager"
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/></svg>',
                        ).toString("base64")}`}
                      />
                    )}
                  </div>
                ),
              }))}
              size="large"
              asPhotosOnly
            />
          </div>

          <div className="w-full p-3 flex flex-col h-full">
            <h2 className="flex flex-row justify-between text-left font-medium font-sans text-2xl">
              {placeData.activityName}
              <span className="flex flex-row items-center text-base font-normal">
                {"4.5"}{" "}
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
                  {"0"}
                  {")"}
                </span>
              </span>
            </h2>

            <span className="py-4 text-sm">{placeData.summary}</span>

            <span className="text-sm text-gray-400">
              {placeData.formatted_address}
            </span>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};

export default POIDrawer;
