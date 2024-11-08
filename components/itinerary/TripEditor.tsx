"use client";

import { useMediaQuery } from "react-responsive";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import TripPlanner from "./TripPlanner";
import { cn } from "@/lib/utils";

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
      : "flex px-6 w-[100dvw] h-[100dvh] border-black rounded-xl overflow-hidden"
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
          <TripPlanner />
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};

export default TripEditor;
