"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import MarkerInfoCard from "@/components/ui/MarkerInfoCard";
import { memo, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { usePOIDrawerStore } from "@/lib/stores/poi-drawer-store";
import POIDrawer from "./POIDrawer";
import { usePOIStore } from "@/lib/stores/poi-store";
import MapMarker from "./MapMarker";

// Move these to types/maps.ts
type InterestMarkersProps = {
  pois: google.maps.places.Place[];
};
type MarkerProps = {
  poi: google.maps.places.Place;
  isOpen: boolean;
  onMarkerClick: () => void;
  onPointerEnter: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
  dialogPosition: DialogPosition | null;
  style?: React.CSSProperties;
};

type DialogPosition = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

// Move these to constants/maps.ts
const DIALOG_DIMENSIONS = {
  width: 304,
  height: 436,
  padding: 16,
  markerSize: 48,
} as const;

const InterestMarkers = memo(({ pois }: InterestMarkersProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dialogPosition, setDialogPosition] = useState<DialogPosition | null>(null);
  const { markerId, setMarkerId } = usePOIStore();
  const { setShowDrawer } = usePOIDrawerStore();
  const timerRef = useRef<NodeJS.Timeout>();

  const calculateDialogPosition = useCallback((rect: DOMRect) => {
    if (typeof window === 'undefined') return null;

    const { width: dialogWidth, height: dialogHeight, padding } = DIALOG_DIMENSIONS;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let position: DialogPosition = {};

    // Get the marker element's bounds
    const markerLeft = rect.left;
    const markerRight = rect.right;
    const markerCenterX = rect.left + (rect.width / 2);
    const markerCenterY = rect.top + (rect.height / 2);

    // Horizontal positioning
    // Try to center the dialog relative to the marker first
    let idealLeft = markerCenterX - (dialogWidth / 2);
    
    // Check if centered position would overflow viewport
    if (idealLeft < padding) {
      // Too close to left edge, align with left edge + padding
      position.left = padding;
    } else if (idealLeft + dialogWidth > viewportWidth - padding) {
      // Too close to right edge, align with right edge - padding
      position.left = viewportWidth - dialogWidth - padding;
    } else {
      // Centered position works fine
      position.left = idealLeft;
    }

    // Vertical positioning
    const idealTop = markerCenterY - (dialogHeight / 2);
    
    // Check if dialog would overflow top or bottom
    if (idealTop < padding) {
      // Too close to top, position below marker
      position.top = rect.bottom + padding;
    } else if (idealTop + dialogHeight > viewportHeight - padding) {
      // Too close to bottom, position above marker
      position.top = rect.top - dialogHeight - padding;
    } else {
      // Centered position works fine
      position.top = idealTop;
    }

    return position;
  }, []);

  const handlePointerEnter = useCallback((e: PointerEvent, poi: google.maps.places.Place) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Only calculate position if dialog isn't already open
    if (!markerId) {
      const markerElement = e.currentTarget as HTMLElement;
      const markerRect = markerElement.getBoundingClientRect();
      const position = calculateDialogPosition(markerRect);
      setDialogPosition(position);
    }
    
    setMarkerId(`${poi.id}`);
  }, [calculateDialogPosition, setMarkerId, markerId]);

  const handlePointerLeave = () => {
    timerRef.current = setTimeout(() => {
      setMarkerId("");
      setDialogPosition(null);
    }, 400);
  };

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      const markerElement = document.querySelector(`[data-poi-id="${markerId}"]`);
      if (markerElement) {
        const markerRect = markerElement.getBoundingClientRect();
        const position = calculateDialogPosition(markerRect);
        setDialogPosition(position);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [markerId, calculateDialogPosition]);

  // Clean up event listeners and timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      {pois.map((poi: google.maps.places.Place, index: number) => {
        const isOpen = markerId === `${poi.id}`;
        
        return (
          <Marker
            key={`${poi.id}`}
            poi={poi}
            isOpen={isOpen}
            dialogPosition={dialogPosition}
            onMarkerClick={() => {
              setMarkerId("");
              setShowDrawer(true);
            }}
            onPointerEnter={(e) => handlePointerEnter(e, poi)}
            onPointerLeave={handlePointerLeave}
            style={{ animationDelay: `${index * 150}ms` }}
          />
        );
      })}
    </>
  );
});

const Marker = memo(({ 
  poi, 
  isOpen, 
  onMarkerClick, 
  onPointerEnter, 
  onPointerLeave,
  dialogPosition,
  style
}: MarkerProps) => (
  <AdvancedMarker
    position={{
      lat: poi.location?.lat() ?? 0,
      lng: poi.location?.lng() ?? 0
    }}
    onClick={onMarkerClick}
    className="group z-1 hover:z-5"
  >
    <div style={style} className="opacity-0 animate-drop-bounce">
      <MapMarker
        poi={poi}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    </div>
    {isOpen && (
      <Dialog
        open={isOpen}
        modal={false}
      >
        <DialogPortal>
          <DialogTitle className="hidden">{poi.displayName}</DialogTitle>
          <DialogOverlay className="fixed inset-0 z-30 bg-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogContent
            id="AdvancedMarker"
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            style={dialogPosition ?? {}}
            className="fixed w-[304px] h-fit p-0 rounded-2xl z-50 shadow-lg bg-white transition-all duration-200 ease-in-out"
          >
            <MarkerInfoCard placeData={poi} />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    )}
    <POIDrawer placeData={poi} />
  </AdvancedMarker>
));

Marker.displayName = 'Marker';
InterestMarkers.displayName = 'InterestMarkers';

export default InterestMarkers;