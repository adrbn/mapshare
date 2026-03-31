import { getCollection } from "@/lib/storage";
import { THEME_COLORS, ThemeColor } from "@/lib/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ShareBar from "@/components/ShareBar";
import ListCard from "@/components/ListCard";
import CategoryFilter from "@/components/CategoryFilter";

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

  const theme = THEME_COLORS[(collection.themeColor as ThemeColor) ?? "teal"];
  const totalPlaces = collection.lists.reduce((sum, l) => sum + l.placeCount, 0);
  const categories = [...new Set(collection.lists.map((l) => l.category))];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg}`}>
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <div className="text-5xl mb-4">{collection.coverEmoji}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{collection.title}</h1>
        {collection.subtitle && (
          <p className="text-gray-600 max-w-md mx-auto">{collection.subtitle}</p>
        )}
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
          <span>{collection.lists.length} lists</span>
          <span>&middot;</span>
          <span>{totalPlaces} places</span>
        </div>
      </header>

      {/* Share bar + QR */}
      <ShareBar slug={collection.slug} title={collection.title} />

      {/* Category filter */}
      {categories.length > 1 && (
        <CategoryFilter categories={categories} themeColor={collection.themeColor as ThemeColor} />
      )}

      {/* Lists grid */}
      <main className="max-w-lg mx-auto px-4 pb-12">
        <div className="space-y-3" id="lists-container">
          {collection.lists.map((list) => (
            <ListCard key={list.id} list={list} themeColor={collection.themeColor as ThemeColor} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            Shared with MapShare
          </p>
        </footer>
      </main>
    </div>
  );
}
