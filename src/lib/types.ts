export interface MapList {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly googleMapsUrl: string;
  readonly placeCount: number;
  readonly category: string;
  readonly cardBg?: string; // individual card background
}

export type BgMode = "gradient" | "dark-sheet";

export interface Collection {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly coverEmoji: string;
  readonly coverImageUrl?: string; // cover art URL
  readonly spotifyUrl?: string; // spotify embed URL
  readonly themeColor: string;
  readonly globalCardBg?: string; // global card background
  readonly bgMode?: BgMode; // page background mode
  readonly lists: readonly MapList[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const CARD_BG_OPTIONS = [
  { id: "glass", label: "Glass", value: "bg-white/10 backdrop-blur-xl border-white/20" },
  { id: "white", label: "White", value: "bg-white/90 backdrop-blur-xl border-white/50" },
  { id: "dark", label: "Dark", value: "bg-black/30 backdrop-blur-xl border-white/10" },
  { id: "orange", label: "Warm", value: "bg-orange-500/15 backdrop-blur-xl border-orange-300/20" },
  { id: "violet", label: "Violet", value: "bg-violet-500/15 backdrop-blur-xl border-violet-300/20" },
  { id: "sky", label: "Sky", value: "bg-sky-500/15 backdrop-blur-xl border-sky-300/20" },
  { id: "rose", label: "Rose", value: "bg-rose-500/15 backdrop-blur-xl border-rose-300/20" },
  { id: "emerald", label: "Emerald", value: "bg-emerald-500/15 backdrop-blur-xl border-emerald-300/20" },
] as const;

export const CATEGORIES = [
  "Food & Drink",
  "Nightlife",
  "Culture",
  "Shopping",
  "Activities",
  "Accommodation",
  "Transport",
  "Services",
  "Other",
] as const;
