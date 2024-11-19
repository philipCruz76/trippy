"use client";
import { useNavDrawerStore } from "@/lib/stores/nav-store";
import { useSignInModalStore } from "@/lib/stores/signin-modal-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { lazy, useEffect, useState } from "react";
import SignInModal from "../sign-in/SignInModal";
import { useTripEditorStore } from "@/lib/stores/trip-editor-store";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

const MenuDrawer = lazy(() => import("@/components/navigation/MenuDrawer"));

const NavBar = () => {
  const { data: session } = useSession();
  const { showNav, setShowNav } = useNavDrawerStore();
  const { showModal, setShowModal } = useSignInModalStore();
  const { showEditor, setShowEditor } = useTripEditorStore();
  const { tripActivities } = useTripEditorStore();
  const [hasScrolledDown, setHasScrolledDown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const verticalScrollPx = window.scrollY;
      if (verticalScrollPx > 60) {
        setHasScrolledDown(true);
      } else {
        setHasScrolledDown(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={cn(
        "fixed justify-between px-4 inset-x-0 z-10 flex h-16 items-center transition-colors duration-500",
        hasScrolledDown && "bg-background/80 backdrop-blur-md",
      )}
    >
      {/* Hamburger Menu */}
      <div className="px-2">
        <button
          className="group flex items-center py-2 hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-full w-[44px] h-[44px] justify-center transition duration-200 hover:scale-110 ease-in-out"
          onClick={() => {
            setShowNav(!showNav);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="38"
            height="38"
            fill="none"
            viewBox="0 0 24 24"
            id="hamburger-menu"
          >
            <path
              stroke="#363636"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 8H16M6 12H18M8 16H15"
            ></path>
          </svg>
        </button>
        {showNav ? <MenuDrawer /> : null}
      </div>
      {/* Nav Links */}

      <ul className="flex flex-row gap-4 items-center justify-center text-center text-sm">
        <li className="hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-2xl px-4 py-2 cursor-pointer">
          <Link href={"/explore"}>Start Exploring</Link>
        </li>
        <li className="hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-2xl px-4 py-2 cursor-pointer">
          <Link href={"/create"}>Creator Program</Link>
        </li>
      </ul>

      {/* Website Logo */}
      <Link
        href={"/"}
        className="flex items-center place-content-center justify-center min-w-[700px] h-[40px]"
      >
        <Image
          className="hover:scale-110 transform ease-in-out duration-300"
          src={"/icons/travel.svg"}
          width={40}
          height={40}
          alt="Trippy Logo"
        />
      </Link>
      {tripActivities && tripActivities.length > 0 ? (
        <button
          onClick={() => {
            setShowEditor(!showEditor);
          }}
          className="group group/button relative z-0 border inline-flex justify-center  items-center rounded-full font-medium outline-none gap-[.3em] disabled:pointer-events-none disabled:opacity-50 transition-colors text-center py-[.25em] text-balance bg-background text-foreground border-input data-[state=open]:border-black data-[state=active]:border-black hover:border-black text-sm min-h-[32px] px-4 leading-[1.125]"
        >
          <span className="flex flex-row truncate  gap-1 items-center justify-center font-semibold">
            <Image src={"/icons/trip.svg"} height={20} width={20}  alt="Trip Icon" className="w-[20px] h-[20px]"/>
            Trip
            <span className="text-xs text-white font-light rounded-full bg-sky-500  p-[4px]">
              {tripActivities.reduce((acc, day) => acc + day.length, 0)}
            </span>
          </span>
        </button>
      ) : null}

      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-full px-4 min-h-[32px] cursor-pointer flex items-center gap-2">
            <Image
              src={session.user?.image || "/default-avatar.png"}
              alt="Profile"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>{session.user?.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => signOut()}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <button
            onClick={() => setShowModal(!showModal)}
            className="hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-full px-4 min-h-[32px] cursor-pointer"
          >
            Sign In
          </button>
          {showModal ? <SignInModal /> : null}
        </>
      )}
    </nav>
  );
};

export default NavBar;
