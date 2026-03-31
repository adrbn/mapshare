import { getCollection } from "@/lib/storage";
import { notFound } from "next/navigation";
import { Metadata } from "next";
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
    description: collection.subtitle || `${collection.lists.length} curated lists with ${totalPlaces} places`,
    openGraph: {
      title: `${collection.coverEmoji} ${collection.title}`,
      description: collection.subtitle || `${collection.lists.length} curated lists with ${totalPlaces} places`,
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) notFound();

  const totalPlaces = collection.lists.reduce((sum, l) => sum + l.placeCount, 0);
  const categories = [...new Set(collection.lists.map((l) => l.category))];

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-14 pb-6 px-6 text-center">
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

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {collection.title}
          </h1>
          {collection.subtitle && (
            <p className="text-white/50 max-w-sm mx-auto text-[15px] leading-relaxed">
              {collection.subtitle}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-4 text-[13px] text-white/35">
            <span>{collection.lists.length} lists</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{totalPlaces} places</span>
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
            <p className="text-[11px] text-white/20 tracking-wide">
              Shared with MapShare
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
