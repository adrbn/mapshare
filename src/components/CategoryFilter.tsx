"use client";

import { useState } from "react";

interface CategoryFilterProps {
  readonly categories: readonly string[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const [active, setActive] = useState<string | null>(null);

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
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            active === null
              ? "bg-white/20 text-white border border-white/30"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              active === cat
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
