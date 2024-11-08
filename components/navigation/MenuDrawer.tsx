"use client";

import { useNavDrawerStore } from "@/lib/stores/nav-store";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import Image from "next/image";
import Link from "next/link";
import { useSignInModalStore } from "@/lib/stores/signin-modal-store";

type MenuDrawerProps = {};

const MenuDrawer = ({}: MenuDrawerProps) => {
  const { showNav, setShowNav } = useNavDrawerStore();
  const { setShowModal } = useSignInModalStore();
  return (
    <>
      <Drawer direction="left" open={showNav} dismissible={false}>
        <DrawerPortal>
          <DrawerOverlay className="fixed inset-0 z-50 translate-x-0 bg-black backdrop-blur-sm bg-opacity-20" />
          <DrawerContent
            onInteractOutside={() => {
              setShowNav(false);
            }}
            className="fixed border-none bottom-0 left-0 right-0 z-50 mt-24 flex max-h-[100dvh] min-h-[100dvh] w-[240px] flex-col gap-4 bg-white px-4 py-6"
          >
            {/* Menu Content */}
            <div className="flex flex-col h-full w-full justify-start items-start gap-[12px]">
              {/* Logo */}
              <Link
                href={"/"}
                className="w-full flex items-center justify-center group"
              >
                <Image
                  src={"/icons/travel.svg"}
                  alt="Trippy Logo"
                  width={40}
                  height={40}
                  className="group-hover:scale-105 transform ease-in-out duration-300"
                />
              </Link>
              {/* Home */}
              <Link
                href={"/"}
                className="flex flex-row gap-4 items-center justify-start transition duration-200 hover:text-gray-400"
              >
                <Image
                  src={"/home.svg"}
                  alt="home-icon"
                  width={20}
                  height={20}
                />
                <span className="font-sans font-medium">Home</span>
              </Link>
              {/* Chat */}
              <Link
                href={"/chat/cenas"}
                className="flex flex-row gap-4 items-center justify-start transition duration-200 hover:text-gray-400"
              >
                <Image
                  src={"/chat-circle.svg"}
                  alt="chat-icon"
                  width={20}
                  height={20}
                />
                <span className="font-sans font-medium">Start chatting</span>
              </Link>
              {/* Explore */}
              <Link
                href={"/explore"}
                className="flex flex-row gap-4 items-center justify-start transition duration-200 hover:text-gray-400"
              >
                <Image
                  src={"/explore-compass.svg"}
                  alt="explore-icon"
                  width={20}
                  height={20}
                />
                <span className="font-sans font-medium">Explore</span>
              </Link>
              {/* Create Itinerary */}
              <Link
                href={"/create"}
                className="flex flex-row gap-4 items-center justify-start transition duration-200 hover:text-gray-400"
              >
                <Image
                  alt="create-icon"
                  src={"/create-icon.svg"}
                  width={20}
                  height={20}
                />
                <span className="font-sans font-medium">Create Trip</span>
              </Link>
              {/* Sign In */}
              <button
                onClick={() => {
                  setShowNav(false);
                  setShowModal(true);
                }}
                className="w-full h-[40px] border border-[#251F1F] text-[#251F1F] hover:bg-black hover:border-black hover:text-white hover:scale-110 transform ease-in-out duration-300 rounded-2xl bg-transparent"
              >
                Sign In
              </button>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </>
  );
};

export default MenuDrawer;
