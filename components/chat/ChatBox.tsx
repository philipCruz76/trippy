"use client";

import { useGPTResponseStore } from "@/lib/stores/gpt-response-store";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import TextareaAutoSize from "react-textarea-autosize";
type ChatBoxProps = {};

const ChatBox = ({}: ChatBoxProps) => {
  const {setKeywords, setGeoLocation, setGptInteractionStarted} = useGPTResponseStore();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");

  const sendMessage = () => {
    if (!input) return;
    setGptInteractionStarted(true);
    fetch("/api/messages", {
      method: "POST",
      body: JSON.stringify({ text: input, chatId: "cenas" }),
    })
      .then(async (res) => {
        const gptReply = await res.json();
        if(gptReply.aiLocation === "Error" || !gptReply.aiLocation) throw new Error("CHAT_KEYWORD_ERROR");
        setKeywords(gptReply.aiResponse);
        setGeoLocation(gptReply.aiLocation);
      })
      .catch((error) => {
        toast.error(error.message);
      });

    setInput("");
    textareaRef.current?.focus();
  };
  
  return (
    <form className="relative flex flex-row items-center gap-2 border-gray-7 transition-colors hover:border-gray-8 rounded-t-2xl border-t px-4 py-2 mobile:rounded-3xl mobile:border-2">
      <TextareaAutoSize
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Message Trippy"
        className="scrollbar-hide w-full resize-none bg-transparent outline-none placeholder:text-gray-500 focus:placeholder:text-gray-8 pr-12"
      />
      <button
        type="button"
        name="send message"
        className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        onClick={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="21"
          fill="currentColor"
          viewBox="0 0 256 256"
          transform="scale(-1, 1)"
          className="text-gray-400 transition-colors hover:text-gray-600"
        >
          <path d="M229.33,98.21,53.41,33l-.16-.05A16,16,0,0,0,32.9,53.25a1,1,0,0,0,.05.16L98.21,229.33A15.77,15.77,0,0,0,113.28,240h.3a15.77,15.77,0,0,0,15-11.29l23.56-76.56,76.56-23.56a16,16,0,0,0,.62-30.38ZM224,113.3l-76.56,23.56a16,16,0,0,0-10.58,10.58L113.3,224h0l-.06-.17L48,48l175.82,65.22.16.06Z"></path>
        </svg>
      </button>
    </form>
  );
};

export default ChatBox;
