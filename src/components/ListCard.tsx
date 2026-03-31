"use client";

import { MapList, THEME_COLORS, ThemeColor } from "@/lib/types";

interface ListCardProps {
  readonly list: MapList;
  readonly themeColor: ThemeColor;
}

export default function ListCard({ list, themeColor }: ListCardProps) {
  const theme = THEME_COLORS[themeColor];

  return (
    <a
      href={list.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-category={list.category}
      className="block bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center">
          {list.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 truncate">{list.name}</h3>
          </div>
          {list.description && (
            <p className="text-sm text-gray-500 truncate">{list.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full ${theme.badge}`}>
              {list.category}
            </span>
            <span className="text-xs text-gray-400">
              {list.placeCount} {list.placeCount === 1 ? "place" : "places"}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
      </div>
    </a>
  );
}
