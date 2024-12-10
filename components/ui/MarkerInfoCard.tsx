"use client";

import { formatNum } from "@/lib/utils";
import { useEffect, useState } from "react";
import { UnsplashImage } from "@/types/unsplash.types";
import { useCachedState } from "@/lib/hooks/useCachedState";
import Carousel from "@/components/ui/Carousel";

type PhotoData = {
  url: string;
  width: number;
  height: number;
};

type MapboxPlace = {
  id: string;
  type: "Feature";
  place_type: string[];
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
    description?: string;
    rating: number;
    userRatingCount: number;
    photos: PhotoData[];
  };
};

type CarouselSlide = {
  url: string;
  isLoading: boolean;
  width?: number;
  height?: number;
};

type MarkerInfoCardProps = {
  placeData: MapboxPlace;
};

export default function MarkerInfoCard({ placeData }: MarkerInfoCardProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);

  useEffect(() => {
    const photos = placeData.properties.photos;
    if (photos && Array.isArray(photos) && photos.length > 0) {
      setSlides(
        photos.map((photo) => ({
          url: photo.url,
          isLoading: false,
        }))
      );
    }
  }, [placeData.properties.photos]);

  return (
    <div className="flex flex-col">
      <div className="relative h-44 w-full">
        <Carousel size="large" slides={slides} />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <span className="font-semibold">{placeData.properties.name}</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#000000"
              viewBox="0 0 256 256"
            >
              <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"></path>
            </svg>
            <span>{placeData.properties.rating || 'N/A'}</span>
            <span className="text-sm text-gray-400">
              {" ("}
              {formatNum(placeData.properties.userRatingCount || 0)}
              {")"}
            </span>
          </span>
        </span>
        <span className="py-4 text-sm">{placeData.properties.description}</span>
      </div>
    </div>
  );
}
