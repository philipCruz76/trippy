"use client";

import { useMediaQuery } from "react-responsive";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import TripPlanner from "./TripPlanner";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * TripEditor component that provides a drawer interface for trip planning
 * Handles responsive behavior between desktop and mobile views
 */
const TripEditor = () => {
  const { showEditor, setShowEditor } = useTripEditorStore();
  const isDesktop = useMediaQuery({ minWidth: 900 });

  // CSS classes for different viewport sizes
  const drawerContentClasses = cn(
    isDesktop
      ? "fixed border-gray-300/80 shadow-md rounded-tl-xl rounded-bl-xl right-0 bottom-0 z-50 mt-24 flex h-[100dvh] w-[50dvw] flex-col bg-white px-4 py-6 overflow-hidden"
      : "flex px-6 w-[100dvw] h-[100dvh] border-black rounded-xl overflow-hidden",
  );

  return (
    <Drawer
      direction="right"
      open={showEditor}
      onClose={() => setShowEditor(false)}
    >
      
      <DrawerPortal>
        <DrawerOverlay
          className={cn(isDesktop ? "fixed inset-0 z-50 bg-none" : "")}
        />
       
        <DrawerContent
          onInteractOutside={() => setShowEditor(false)}
          className={drawerContentClasses}
        >
           {!isDesktop && (
            <DrawerClose onClick={() => setShowEditor(false)} className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
              <X className="h-[18px] w-[18px]" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          )}
          <TripPlanner />
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};

export default TripEditor;
