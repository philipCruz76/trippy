import Image from 'next/image';
import { markerSVGSelector } from "@/lib/utils/map-utils";
import { cn } from '@/lib/utils';

type MapMarkerProps = {
  poi: google.maps.places.Place;
  onPointerEnter: (e: React.PointerEvent, poi: google.maps.places.Place) => void;
  onPointerLeave: () => void;
  className?: string;
};

const MapMarker = ({ poi, onPointerEnter, onPointerLeave, className }: MapMarkerProps) => {
  const svgIcon = markerSVGSelector(poi.svgIconMaskURI);
  
  return (
    <div 
      data-poi-id={poi.id}
      onPointerEnter={(e) => onPointerEnter(e, poi)}
      onPointerLeave={onPointerLeave}
      className={cn("border p-1 bg-white relative block cursor-pointer rounded-full", className)}
    >
      <Image
        alt={svgIcon.alt}
        width={19}
        height={19}
        src={svgIcon.src}
        className="shrink-0 transform-cpu fill-black group-hover:fill-white w-[19px] h-[19px]"
      />
    </div>
  );
};

export default MapMarker; 