"use client";
import { useSignInModalStore } from "@/lib/stores/signin-modal-store";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "react-responsive";
import { Drawer, DrawerContent, DrawerPortal } from "@/components/ui/drawer";
import GoogleSignInButton from "@/components/sign-in/GoogleSignInButton";

type SignInModalProps = {};

const SignInModal = ({}: SignInModalProps) => {
  const { showModal, setShowModal } = useSignInModalStore();
  const isDesktop = useMediaQuery({minWidth:900});

  if (isDesktop) {
    return (
      <Dialog open={showModal} modal onOpenChange={() => setShowModal(false)}>
        <DialogContent className="max-w-[425px] h-[90dvh] pt-6 rounded-xl overflow-y-scroll">
          {/* Header Area */}
          <h2 className="flex w-full items-center justify-center text-center font-medium text-lg">
            Sign in
          </h2>
          <div className="h-[1px] border w-full border-gray-200" />

          {/* Email Sign in area */}
          <div className="w-full h-fit flex p-2 gap-4 flex-col">
            <h2 className="font-bold text-3xl">Welcome</h2>
            <span className="text-sm">
              {" "}
              New to Trippy? Create an account or Sign in with Google
            </span>
            {/* E-mail sign-in form */}
            <form className="flex flex-col w-full h-[200px]">
              <div className="pb-2">
                <Label
                  htmlFor="email"
                  className="font-semibold font-sans text-lg"
                >
                  {" "}
                  Email
                </Label>
                <Input
                  id="email"
                  disabled
                  type="text"
                  className="w-full overflow-x-scroll border h-[34px] rounded-xl border-gray-400"
                />
              </div>

              <div className="pb-5">
                <Label
                  htmlFor="password"
                  className="font-semibold font-sans text-lg"
                >
                  {" "}
                  Password
                </Label>
                <Input
                  id="password"
                  disabled
                  type="text"
                  className="w-full overflow-x-scroll border h-[34px] rounded-xl border-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled
                className="flex items-center justify-center border rounded-xl w-full h-[40px] bg-black hover:bg-black/80 cursor-not-allowed"
              >
                <span className="text-slate-100 px-2 text-center font-light">
                  Continue
                </span>
              </button>
            </form>
          </div>

          {/* Google Sign in area */}

          <div className="px-2">
            <GoogleSignInButton />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={!isDesktop} onClose={() => setShowModal(false)}>
      <DrawerPortal>
        <DrawerContent className="flex px-6 w-[100dvw] h-[88dvh] rounded-xl overflow-y-scroll">
          {/* Header Area */}
          <button
            onClick={() => {
              setShowModal(false);
            }}
            className="absolute top-3 left-5 hover:border hover:border-black rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="#000000"
              viewBox="0 0 256 256"
            >
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
            </svg>
          </button>
          <h2 className="flex w-full h-[80px] items-center justify-center text-center font-medium text-lg">
            Sign in
          </h2>
          <div className="h-[1px] border w-full border-gray-200" />

          {/* Email Sign in area */}
          <div className="w-full h-fit flex p-2 gap-4 flex-col">
            <h2 className="font-bold text-3xl">Welcome</h2>
            <span className="text-sm">
              {" "}
              New to Trippy? Create an account or Sign in with Google
            </span>
            {/* E-mail sign-in form */}
            <form className="flex flex-col w-full h-[200px]">
              <div className="pb-2">
                <Label
                  htmlFor="email"
                  className="font-semibold font-sans text-lg"
                >
                  {" "}
                  Email
                </Label>
                <Input
                  id="email"
                  type="text"
                  className="w-full overflow-x-scroll border h-[34px] rounded-xl border-gray-400"
                />
              </div>

              <div className="pb-5">
                <Label
                  htmlFor="password"
                  className="font-semibold font-sans text-lg"
                >
                  {" "}
                  Password
                </Label>
                <Input
                  id="password"
                  type="text"
                  className="w-full overflow-x-scroll border h-[34px] rounded-xl border-gray-400"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center border rounded-xl w-full h-[40px] bg-black hover:bg-black/80"
              >
                <span className="text-slate-100 px-2 text-center font-light">
                  Continue
                </span>
              </button>
            </form>
          </div>

          {/* Google Sign in area */}

          <div className="px-2">
            <GoogleSignInButton />
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};

export default SignInModal;
