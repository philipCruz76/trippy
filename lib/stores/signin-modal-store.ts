import { create } from "zustand";

type SignInModalState = {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
};

export const useSignInModalStore = create<SignInModalState>()((set) => ({
  showModal: false,
  setShowModal: (showModal: boolean) => set({ showModal }),
}));
