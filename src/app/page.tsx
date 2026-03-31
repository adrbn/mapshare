import { getCollections } from "@/lib/storage";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const collections = await getCollections();

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10">
        <header className="pt-20 pb-12 px-6 text-center">
          <div className="text-5xl mb-5">🗺️</div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">MapShare</h1>
          <p className="text-white/50 max-w-md mx-auto text-lg">
            Share your favorite Google Maps lists with anyone, beautifully.
          </p>
        </header>

        <main className="max-w-lg mx-auto px-4 pb-16">
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/30 mb-6">No collections shared yet.</p>
              <Link
                href="/admin"
                className="inline-block glass-strong text-white px-6 py-3 rounded-2xl font-medium hover:bg-white/20 transition-all duration-200"
              >
                Create your first collection
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map((c) => {
                const totalPlaces = c.lists.reduce((sum, l) => sum + l.placeCount, 0);
                return (
                  <Link
                    key={c.id}
                    href={`/${c.slug}`}
                    className="block glass-card rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-4">
                      {c.coverImageUrl ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                          <img src={c.coverImageUrl} alt={c.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="text-4xl flex-shrink-0">{c.coverEmoji}</div>
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-white/90">{c.title}</h2>
                        {c.subtitle && (
                          <p className="text-sm text-white/40 mt-0.5">{c.subtitle}</p>
                        )}
                        <p className="text-xs text-white/25 mt-1">
                          {c.lists.length} lists &middot; {totalPlaces} places
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}

              <div className="text-center pt-10">
                <Link
                  href="/admin"
                  className="text-sm text-white/20 hover:text-white/40 transition-colors"
                >
                  Admin
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
