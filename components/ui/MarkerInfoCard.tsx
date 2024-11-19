"use client";

import { formatNum } from "@/lib/utils";
import { useEffect, useState } from "react";
import { UnsplashImage } from "@/types/unsplash.types";
import { useCachedState } from "@/lib/hooks/useCachedState";
import Carousel from "@/components/ui/Carousel";


type CarouselSlide = {
  url: string;
  isLoading: boolean;
  width?: number;
  height?: number;
};

type MarkerInfoCardProps = {
  placeData: google.maps.places.Place;
};

/**
 * MarkerInfoCard component for displaying place information
 * Shows photos, ratings, and details about a location
 */
const MarkerInfoCard = ({ placeData }: MarkerInfoCardProps) => {
  // State management with caching
  const [coverPhotos, setCoverPhoto] = useCachedState<CarouselSlide[]>("infoCardPhotos", [{
    url: "",
    isLoading: true
  }]);
  const [photoDetails, setPhotoDetails] = useState<UnsplashImage[]>();


  /* ALTERNATIVE: Unsplash API get photos 
  useEffect(() => {
    const getPlaceCoverPhoto = async () => {
      const cover = await getUnsplashImage(placeData.displayName!);
      let placeGallery: string[] = [""];
      for (let i = 0; i < cover.images.length; i++) {
        placeGallery[i] = cover.images[i].url;
      }
      setCoverPhoto(placeGallery);
      setPhotoDetails(cover.images);
    };
    getPlaceCoverPhoto();
  }, []);
*/

  /**
   * Updates cover photos when place data changes
   */
  useEffect(() => {
    const placeGallery: CarouselSlide[] = [];

    placeData.photos?.forEach(photo => {
      placeGallery.push({
        url: photo.getURI(),
        isLoading: false,
        width: undefined,
        height: undefined
      });
    });
    
    setCoverPhoto(placeGallery);
  }, [placeData]);

  return (
    <div className="w-[304px] min-h-[347px]">
      {/* Photo Carousel */}
      <Carousel
        slides={coverPhotos}
        size="custom"
        customHeight="300"
        asPhotosOnly
      />
      
      {/* Place Information */}
      <div className="w-full h-fit p-3">
        <span className="flex justify-between w-full font-sans font-medium">
          {placeData.displayName}
          <span className="flex flex-row items-center text-base font-normal">
            {placeData.rating}
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
              {" ("}
              {formatNum(placeData.userRatingCount!)}
              {")"}
            </span>
          </span>
        </span>

        <span className="py-4 text-sm">{placeData.editorialSummary}</span>
      </div>
    </div>
  );
};

export default MarkerInfoCard;
