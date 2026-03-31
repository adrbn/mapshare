"use client";

import { useState, useEffect, useCallback } from "react";
import { Collection, MapList, THEME_COLORS, CATEGORIES, ThemeColor } from "@/lib/types";
import { nanoid } from "nanoid";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchCollections = useCallback(async () => {
    const res = await fetch("/api/collections");
    const json = await res.json();
    if (json.success) setCollections(json.data);
  }, []);

  useEffect(() => {
    if (authenticated) fetchCollections();
  }, [authenticated, fetchCollections]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticated(true);
    fetchCollections();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center">MapShare Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">MapShare Admin</h1>
          <button
            onClick={() => setCreating(true)}
            className="bg-teal-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            + New Collection
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {(creating || editing) && (
          <CollectionEditor
            collection={editing}
            password={password}
            onSave={() => {
              setCreating(false);
              setEditing(null);
              fetchCollections();
            }}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        )}

        {!creating && !editing && (
          <div className="space-y-4">
            {collections.length === 0 && (
              <p className="text-center text-gray-500 py-12">
                No collections yet. Create your first one!
              </p>
            )}
            {collections.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{c.coverEmoji}</span>
                    <h2 className="text-lg font-semibold">{c.title}</h2>
                  </div>
                  <p className="text-gray-500 text-sm">
                    /{c.slug} &middot; {c.lists.length} lists &middot;{" "}
                    {c.lists.reduce((sum, l) => sum + l.placeCount, 0)} places
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/${c.slug}`}
                    target="_blank"
                    className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => setEditing(c)}
                    className="px-3 py-2 text-sm bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this collection?")) return;
                      await fetch(`/api/collections/${c.id}`, {
                        method: "DELETE",
                        headers: { "x-admin-password": password },
                      });
                      fetchCollections();
                    }}
                    className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface CollectionEditorProps {
  collection: Collection | null;
  password: string;
  onSave: () => void;
  onCancel: () => void;
}

function CollectionEditor({ collection, password, onSave, onCancel }: CollectionEditorProps) {
  const [title, setTitle] = useState(collection?.title ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [subtitle, setSubtitle] = useState(collection?.subtitle ?? "");
  const [coverEmoji, setCoverEmoji] = useState(collection?.coverEmoji ?? "📍");
  const [themeColor, setThemeColor] = useState<ThemeColor>((collection?.themeColor as ThemeColor) ?? "teal");
  const [lists, setLists] = useState<MapList[]>([...(collection?.lists ?? [])]);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!collection);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (autoSlug) setSlug(slugify(value));
  };

  const addList = () => {
    const newList: MapList = {
      id: nanoid(),
      name: "",
      emoji: "📌",
      description: "",
      googleMapsUrl: "",
      placeCount: 0,
      category: "Other",
    };
    setLists([...lists, newList]);
  };

  const updateList = (id: string, updates: Partial<MapList>) => {
    setLists(lists.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeList = (id: string) => {
    setLists(lists.filter((l) => l.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    const body = { title, slug, subtitle, coverEmoji, themeColor, lists };

    if (collection) {
      await fetch(`/api/collections/${collection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(body),
      });
    }

    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6">
        {collection ? "Edit Collection" : "New Collection"}
      </h2>

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
            <input
              value={coverEmoji}
              onChange={(e) => setCoverEmoji(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-center text-2xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Best of Rome"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">/</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="best-of-rome"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="My favorite spots, curated with love"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(THEME_COLORS) as ThemeColor[]).map((color) => (
              <button
                key={color}
                onClick={() => setThemeColor(color)}
                className={`w-10 h-10 rounded-full ${THEME_COLORS[color].accent} transition-all ${
                  themeColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                }`}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Lists ({lists.length})</h3>
          <button
            onClick={addList}
            className="text-sm bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
          >
            + Add List
          </button>
        </div>

        <div className="space-y-4">
          {lists.map((list, index) => (
            <div key={list.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">List #{index + 1}</span>
                <button
                  onClick={() => removeList(list.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-[60px_1fr] gap-3 mb-3">
                <input
                  value={list.emoji}
                  onChange={(e) => updateList(list.id, { emoji: e.target.value })}
                  className="px-2 py-2 border border-gray-200 rounded-lg text-center text-xl bg-white"
                />
                <input
                  value={list.name}
                  onChange={(e) => updateList(list.id, { name: e.target.value })}
                  placeholder="List name (e.g. Ristoranti)"
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <input
                value={list.googleMapsUrl}
                onChange={(e) => updateList(list.id, { googleMapsUrl: e.target.value })}
                placeholder="Google Maps share link (https://maps.app.goo.gl/...)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={list.category}
                  onChange={(e) => updateList(list.id, { category: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={list.placeCount}
                  onChange={(e) => updateList(list.id, { placeCount: parseInt(e.target.value) || 0 })}
                  placeholder="# of places"
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                />
              </div>

              <input
                value={list.description}
                onChange={(e) => updateList(list.id, { description: e.target.value })}
                placeholder="Short description (optional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title || !slug}
          className="flex-1 py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Collection"}
        </button>
      </div>
    </div>
  );
}
