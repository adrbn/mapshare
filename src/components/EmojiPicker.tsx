"use client";

import { useState, useRef, useEffect } from "react";
import Picker from "emoji-picker-react";

interface EmojiPickerProps {
  readonly value: string;
  readonly onChange: (emoji: string) => void;
  readonly size?: "sm" | "md";
}

export default function EmojiPicker({ value, onChange, size = "md" }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const sizeClass = size === "sm" ? "w-10 h-10 text-lg" : "w-14 h-14 text-2xl";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${sizeClass} rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer`}
      >
        {value}
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0">
          <Picker
            onEmojiClick={(emojiData) => {
              onChange(emojiData.emoji);
              setOpen(false);
            }}
            width={320}
            height={400}
          />
        </div>
      )}
    </div>
  );
}
