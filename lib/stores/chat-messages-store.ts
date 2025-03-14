import { create } from "zustand";
import { produce } from "immer";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type ChatMessagesState = {
  messages: Message[];
  isLoading: boolean;
  addMessage: (text: string, isUser: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  clearMessages: () => void;
};

export const useChatMessagesStore = create<ChatMessagesState>()((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (text: string, isUser: boolean) =>
    set(
      produce((state) => {
        state.messages.push({
          id: crypto.randomUUID(),
          text,
          isUser,
          timestamp: new Date(),
        });
      }),
    ),

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),
}));
