export interface MapList {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly googleMapsUrl: string;
  readonly placeCount: number;
  readonly category: string;
}

export interface Collection {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly coverEmoji: string;
  readonly themeColor: string;
  readonly lists: readonly MapList[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ThemeColor =
  | "rose"
  | "orange"
  | "amber"
  | "emerald"
  | "teal"
  | "sky"
  | "violet"
  | "fuchsia";

export const THEME_COLORS: Record<ThemeColor, { bg: string; accent: string; badge: string }> = {
  rose: { bg: "from-rose-50 to-rose-100", accent: "bg-rose-500", badge: "bg-rose-100 text-rose-700" },
  orange: { bg: "from-orange-50 to-orange-100", accent: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  amber: { bg: "from-amber-50 to-amber-100", accent: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
  emerald: { bg: "from-emerald-50 to-emerald-100", accent: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  teal: { bg: "from-teal-50 to-teal-100", accent: "bg-teal-500", badge: "bg-teal-100 text-teal-700" },
  sky: { bg: "from-sky-50 to-sky-100", accent: "bg-sky-500", badge: "bg-sky-100 text-sky-700" },
  violet: { bg: "from-violet-50 to-violet-100", accent: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
  fuchsia: { bg: "from-fuchsia-50 to-fuchsia-100", accent: "bg-fuchsia-500", badge: "bg-fuchsia-100 text-fuchsia-700" },
};

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
