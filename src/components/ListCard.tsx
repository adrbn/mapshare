"use client";

import { MapList, CARD_BG_OPTIONS } from "@/lib/types";

interface ListCardProps {
  readonly list: MapList;
  readonly globalCardBg?: string;
}

export default function ListCard({ list, globalCardBg }: ListCardProps) {
  const bgId = list.cardBg || globalCardBg || "glass";
  const bgOption = CARD_BG_OPTIONS.find((o) => o.id === bgId);
  const bgClasses = bgOption?.value ?? CARD_BG_OPTIONS[0].value;

  return (
    <a
      href={list.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-category={list.category}
      className={`block rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${bgClasses}`}
      style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)" }}
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center">
          {list.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white/90 truncate text-[15px]">{list.name}</h3>
          {list.description && (
            <p className="text-sm text-white/50 truncate mt-0.5">{list.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
              {list.category}
            </span>
            {list.placeCount > 0 && (
              <span className="text-[11px] text-white/40">
                {list.placeCount} {list.placeCount === 1 ? "place" : "places"}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
      </div>
    </a>
  );
}
