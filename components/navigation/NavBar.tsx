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
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

const MenuDrawer = lazy(() => import("@/components/navigation/MenuDrawer"));

const NavBar = () => {
  const pathname = usePathname();
  const isRootPage = pathname === "/en" || pathname === "/pt";
  const { data: session, status } = useSession();
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
        "fixed justify-between px-4 inset-x-0 top-0 z-50 flex h-16 items-center transition-colors duration-500 w-full",
        isRootPage
          ? "bg-transparent"
          : "bg-white",
        hasScrolledDown && "bg-background/80 backdrop-blur-md"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Hamburger Menu */}
      <div className="px-2">
        <button
          className="group flex items-center py-2 hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-full w-[44px] h-[44px] justify-center transition duration-200 hover:scale-110 ease-in-out"
          onClick={() => setShowNav(!showNav)}
          aria-expanded={showNav}
          aria-label="Toggle navigation menu"
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

      <ul
        className="hidden tablet:flex flex-row gap-4 items-center justify-center text-sm"
        role="menubar"
      >
        <li role="none">
          <Link
            href="/explore"
            className="hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-2xl px-4 py-2 cursor-pointer transition-colors truncate duration-200 inline-block"
            role="menuitem"
          >
            Start Exploring
          </Link>
        </li>
        <li role="none">
          <Link
            href="/create"
            className="hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-2xl px-4 py-2 cursor-pointer transition-colors truncate duration-200 inline-block"
            role="menuitem"
          >
            Creator Program
          </Link>
        </li>
      </ul>

      {/* Website Logo */}
      <Link
        href={"/"}
        className="flex items-center place-content-center justify-center w-full  h-[40px]"
        aria-label="Home"
      >
        <Image
          className=" w-[30px] h-[30px] tablet:w-[40px] tablet:h-[40px] hover:scale-110 transform ease-in-out duration-300"
          src={"/icons/travel.svg"}
          width={40}
          height={40}
          alt="Trippy Logo"
        />
      </Link>
      {tripActivities && tripActivities.length > 0 && (
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="group relative z-0 border inline-flex justify-center items-center rounded-full font-medium outline-none transition-colors text-center py-[.25em] text-balance bg-background text-foreground border-input hover:border-black text-sm min-h-[38px] tablet:min-w-[100px] min-w-[60px] px-1 leading-[1.125]"
          aria-label={`Open trip editor with ${tripActivities.reduce((acc, day) => acc + day.length, 0)} activities`}
        >
          <span className=" flex flex-row  w-fit truncate gap-1 items-center justify-center font-semibold">
            <Image
              src={"/icons/trip.svg"}
              height={20}
              width={20}
              alt=""
              className=" tablet:w-[20px] tablet:h-[20px] mobile:w-[16px] mobile:h-[16px]"
            />
            <p className="truncate hidden tablet:flex">Trip</p>
            <span className=" text-xs text-white tablet:font-semibold rounded-full bg-sky-500 tablet:px-2  px-1 py-1 tablet:min-w-[20px]">
              {tripActivities.reduce((acc, day) => acc + day.length, 0)}
            </span>
          </span>
        </button>
      )}

      {/* Auth Section */}
      <div className=" items-center">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-full px-4 min-h-[32px] cursor-pointer flex items-center gap-2"
              aria-label="User menu"
            >
              <Image
                src={session.user?.image || "/default-avatar.png"}
                alt=""
                width={24}
                height={24}
                className="rounded-full min-w-[24px] min-h-[24px]"
              />
              <span className="hidden desktop:block text-xs truncate">{session.user?.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <button
              onClick={() => setShowModal(!showModal)}
              className="hover:bg-[#A17E4E] hover:bg-opacity-35 rounded-full px-4 min-h-[32px] cursor-pointer transition-colors duration-200"
            >
              Sign In
            </button>
            {showModal ? <SignInModal /> : null}
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
