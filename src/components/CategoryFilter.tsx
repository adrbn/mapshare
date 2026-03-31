"use client";

import { useState } from "react";
import { THEME_COLORS, ThemeColor } from "@/lib/types";

interface CategoryFilterProps {
  readonly categories: readonly string[];
  readonly themeColor: ThemeColor;
}

export default function CategoryFilter({ categories, themeColor }: CategoryFilterProps) {
  const [active, setActive] = useState<string | null>(null);
  const theme = THEME_COLORS[themeColor];

  const handleFilter = (category: string | null) => {
    setActive(category);
    const container = document.getElementById("lists-container");
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>("[data-category]");
    cards.forEach((card) => {
      if (category === null || card.dataset.category === category) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => handleFilter(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === null ? `${theme.accent} text-white` : "bg-white/60 text-gray-600 hover:bg-white/80"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === cat ? `${theme.accent} text-white` : "bg-white/60 text-gray-600 hover:bg-white/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
