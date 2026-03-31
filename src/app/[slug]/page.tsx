import { getCollection } from "@/lib/storage";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ShareBar from "@/components/ShareBar";
import ListCard from "@/components/ListCard";
import CategoryFilter from "@/components/CategoryFilter";
import SpotifyEmbed from "@/components/SpotifyEmbed";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return {};

  const totalPlaces = collection.lists.reduce((sum, l) => sum + l.placeCount, 0);
  return {
    title: `${collection.coverEmoji} ${collection.title} | MapShare`,
    description:
      collection.subtitle ||
      `${collection.lists.length} curated lists with ${totalPlaces} places`,
    openGraph: {
      title: `${collection.coverEmoji} ${collection.title}`,
      description:
        collection.subtitle ||
        `${collection.lists.length} curated lists with ${totalPlaces} places`,
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) notFound();

  const totalPlaces = collection.lists.reduce((sum, l) => sum + l.placeCount, 0);
  const categories = [...new Set(collection.lists.map((l) => l.category))];
  const isDarkSheet = collection.bgMode === "dark-sheet";

  if (isDarkSheet) {
    return (
      <div className="min-h-screen bg-black">
        {/* Back button */}
        <div className="px-6 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Home
          </Link>
        </div>

        {/* White sheet container */}
        <div className="max-w-lg mx-auto px-4 py-6 pb-16">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="pt-10 pb-6 px-6 text-center border-b border-gray-100">
              {collection.coverImageUrl ? (
                <div className="w-28 h-28 mx-auto mb-5 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={collection.coverImageUrl}
                    alt={collection.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-5xl mb-5">{collection.coverEmoji}</div>
              )}

              <h1 className="text-2xl font-stretch tracking-widest text-gray-900 mb-2 uppercase">
                {collection.title}
              </h1>
              {collection.subtitle && (
                <p className="text-gray-500 text-sm leading-relaxed">{collection.subtitle}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-400">
                <span>{collection.lists.length} lists</span>
                {totalPlaces > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{totalPlaces} places</span>
                  </>
                )}
              </div>
            </div>

            {/* Spotify embed */}
            {collection.spotifyUrl && (
              <div className="px-6 pt-4">
                <SpotifyEmbed url={collection.spotifyUrl} />
              </div>
            )}

            {/* Share bar */}
            <div className="px-6 pt-4">
              <ShareBarDark slug={collection.slug} title={collection.title} />
            </div>

            {/* Category filter */}
            {categories.length > 1 && (
              <div className="px-6 pt-4">
                <CategoryFilterDark categories={categories} />
              </div>
            )}

            {/* Lists */}
            <div className="p-6 space-y-3" id="lists-container">
              {collection.lists.map((list) => (
                <ListCardDark key={list.id} list={list} />
              ))}
            </div>

            <div className="pb-8 text-center">
              <p className="text-[11px] text-gray-300 tracking-wide">Shared with MapShare</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Content */}
      <div className="relative z-10">
        {/* Back button */}
        <div className="px-6 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Home
          </Link>
        </div>

        {/* Header */}
        <header className="pt-8 pb-6 px-6 text-center">
          {/* Cover art */}
          {collection.coverImageUrl ? (
            <div className="w-32 h-32 mx-auto mb-5 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20">
              <img
                src={collection.coverImageUrl}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="text-6xl mb-5">{collection.coverEmoji}</div>
          )}

          <h1 className="text-3xl font-stretch tracking-widest text-white mb-2 uppercase">
            {collection.title}
          </h1>
          {collection.subtitle && (
            <p className="text-white/50 max-w-sm mx-auto text-[15px] leading-relaxed">
              {collection.subtitle}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-4 text-[13px] text-white/35">
            <span>{collection.lists.length} lists</span>
            {totalPlaces > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{totalPlaces} places</span>
              </>
            )}
          </div>
        </header>

        {/* Spotify embed */}
        {collection.spotifyUrl && <SpotifyEmbed url={collection.spotifyUrl} />}

        {/* Share bar + QR */}
        <ShareBar slug={collection.slug} title={collection.title} />

        {/* Category filter */}
        {categories.length > 1 && <CategoryFilter categories={categories} />}

        {/* Lists */}
        <main className="max-w-lg mx-auto px-4 pb-16">
          <div className="space-y-3" id="lists-container">
            {collection.lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                globalCardBg={collection.globalCardBg}
              />
            ))}
          </div>

          <footer className="mt-14 text-center">
            <p className="text-[11px] text-white/20 tracking-wide">Shared with MapShare</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Dark-sheet variants of share bar and category filter
function ShareBarDark({ slug, title }: { slug: string; title: string }) {
  return (
    <div className="flex gap-2 mb-2">
      <a
        href={`/${slug}`}
        className="flex-1 flex items-center justify-center gap-2 bg-gray-900 rounded-xl py-2.5 px-4 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        target="_blank"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share {title}
      </a>
    </div>
  );
}

function CategoryFilterDark({ categories }: { categories: readonly string[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
      {categories.map((cat) => (
        <span
          key={cat}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
        >
          {cat}
        </span>
      ))}
    </div>
  );
}

function ListCardDark({ list }: { list: import("@/lib/types").MapList }) {
  return (
    <a
      href={list.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-category={list.category}
      className="block rounded-2xl p-4 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:scale-[1.01]"
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center">
          {list.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-[15px]">{list.name}</h3>
          {list.description && (
            <p className="text-sm text-gray-500 truncate mt-0.5">{list.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
              {list.category}
            </span>
            {list.placeCount > 0 && (
              <span className="text-[11px] text-gray-400">
                {list.placeCount} {list.placeCount === 1 ? "place" : "places"}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-300">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
      </div>
    </a>
  );
}
