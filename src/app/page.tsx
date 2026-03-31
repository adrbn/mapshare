import { getCollections } from "@/lib/storage";
import Link from "next/link";

export default async function HomePage() {
  const collections = await getCollections();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <header className="pt-16 pb-12 px-6 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">MapShare</h1>
        <p className="text-gray-600 max-w-md mx-auto text-lg">
          Share your favorite Google Maps lists with anyone, beautifully.
        </p>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-16">
        {collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No collections shared yet.</p>
            <Link
              href="/admin"
              className="inline-block bg-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-600 transition-colors"
            >
              Create your first collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((c) => {
              const totalPlaces = c.lists.reduce((sum, l) => sum + l.placeCount, 0);
              return (
                <Link
                  key={c.id}
                  href={`/${c.slug}`}
                  className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{c.coverEmoji}</div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{c.title}</h2>
                      {c.subtitle && (
                        <p className="text-sm text-gray-500 mt-0.5">{c.subtitle}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {c.lists.length} lists &middot; {totalPlaces} places
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}

            <div className="text-center pt-8">
              <Link
                href="/admin"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
