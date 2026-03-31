"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Collection, MapList, CATEGORIES, CARD_BG_OPTIONS, BgMode } from "@/lib/types";
import { nanoid } from "nanoid";
import EmojiPicker from "@/components/EmojiPicker";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow text-sm placeholder-gray-400";
const labelClass =
  "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [creating, setCreating] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const fetchCollections = useCallback(async () => {
    const res = await fetch("/api/collections");
    const json = await res.json();
    if (json.success) setCollections(json.data);
  }, []);

  useEffect(() => {
    if (authenticated) fetchCollections();
  }, [authenticated, fetchCollections]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (json.success) {
      setAuthenticated(true);
    } else {
      setLoginError("Wrong password");
    }
    setLoggingIn(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient relative overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <form
          onSubmit={handleLogin}
          className="relative z-10 glass-strong p-8 rounded-3xl w-full max-w-sm"
        >
          <h1 className="text-2xl font-stretch mb-6 text-center text-white tracking-widest uppercase">
            MapShare
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/40"
          />
          {loginError && (
            <p className="text-red-300 text-sm mb-4 text-center">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/30 transition-all disabled:opacity-50 border border-white/20"
          >
            {loggingIn ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-stretch tracking-widest text-gray-900 hover:text-violet-600 transition-colors uppercase">
            MapShare
          </a>
          <button
            onClick={() => setCreating(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + New Collection
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
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
          <div className="space-y-3">
            {collections.length === 0 && (
              <p className="text-center text-gray-400 py-16 text-sm">
                No collections yet. Create your first one!
              </p>
            )}
            {collections.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {c.coverImageUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={c.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <span className="text-2xl">{c.coverEmoji}</span>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900">{c.title}</h2>
                    <p className="text-gray-400 text-xs mt-0.5">
                      /{c.slug} &middot; {c.lists.length} lists
                      {c.lists.reduce((sum, l) => sum + l.placeCount, 0) > 0 && (
                        <> &middot; {c.lists.reduce((sum, l) => sum + l.placeCount, 0)} places</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <a
                    href={`/${c.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => setEditing(c)}
                    className="px-3 py-1.5 text-xs bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
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
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
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
  const [coverImageUrl, setCoverImageUrl] = useState(collection?.coverImageUrl ?? "");
  const [spotifyUrl, setSpotifyUrl] = useState(collection?.spotifyUrl ?? "");
  const [globalCardBg, setGlobalCardBg] = useState(collection?.globalCardBg ?? "glass");
  const [bgMode, setBgMode] = useState<BgMode>(collection?.bgMode ?? "gradient");
  const [lists, setLists] = useState<MapList[]>([...(collection?.lists ?? [])]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [autoSlug, setAutoSlug] = useState(!collection);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (autoSlug) setSlug(slugify(value));
  };

  const addList = () => {
    setLists((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: "",
        emoji: "📌",
        description: "",
        googleMapsUrl: "",
        placeCount: 0,
        category: "Other",
      },
    ]);
  };

  const updateList = (id: string, updates: Partial<MapList>) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeList = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLists((prev) => {
        const oldIndex = prev.findIndex((l) => l.id === active.id);
        const newIndex = prev.findIndex((l) => l.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const body = {
      title,
      slug,
      subtitle,
      coverEmoji,
      coverImageUrl: coverImageUrl || undefined,
      spotifyUrl: spotifyUrl || undefined,
      themeColor: "teal",
      globalCardBg,
      bgMode,
      lists,
    };
    const url = collection ? `/api/collections/${collection.id}` : "/api/collections";
    const method = collection ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setSaveError(json.error || "Failed to save");
      return;
    }
    onSave();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-900">
      <h2 className="text-lg font-bold mb-6 text-gray-900">
        {collection ? "Edit Collection" : "New Collection"}
      </h2>

      {/* Cover section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-end gap-4">
          <div>
            <label className={labelClass}>Cover Emoji</label>
            <EmojiPicker value={coverEmoji} onChange={setCoverEmoji} />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Title</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Best of Rome"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">/</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="best-of-rome"
              className={`flex-1 ${inputClass}`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Subtitle</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="My favorite spots, curated with love"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Cover Image URL (optional, overrides emoji)</label>
          <input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className={inputClass}
          />
          {coverImageUrl && (
            <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
              <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Spotify Link (optional)</label>
          <input
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
            className={inputClass}
          />
          <p className="text-[11px] text-gray-400 mt-1">Track, album, playlist, or artist URL</p>
        </div>

        <div>
          <label className={labelClass}>Background Style</label>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setBgMode("gradient")}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                bgMode === "gradient"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              🌈 Colorful Gradient
            </button>
            <button
              onClick={() => setBgMode("dark-sheet")}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                bgMode === "dark-sheet"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              🖤 Dark + White Sheet
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Global Card Style</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {CARD_BG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setGlobalCardBg(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  globalCardBg === opt.id
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Lists ({lists.length})</h3>
          <button
            onClick={addList}
            className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Add List
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lists.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {lists.map((list, index) => (
                <SortableListItem
                  key={list.id}
                  list={list}
                  index={index}
                  onUpdate={updateList}
                  onRemove={removeList}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          onClick={addList}
          className="mt-4 w-full text-xs bg-gray-100 text-gray-600 px-3 py-3 rounded-xl hover:bg-gray-200 transition-colors border border-dashed border-gray-300"
        >
          + Add List
        </button>
      </div>

      {saveError && (
        <p className="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded-xl">{saveError}</p>
      )}

      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title || !slug}
          className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Collection"}
        </button>
      </div>
    </div>
  );
}

interface SortableListItemProps {
  list: MapList;
  index: number;
  onUpdate: (id: string, updates: Partial<MapList>) => void;
  onRemove: (id: string) => void;
}

function SortableListItem({ list, index, onUpdate, onRemove }: SortableListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-xl p-4 bg-gray-50/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors touch-none"
            title="Drag to reorder"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="10" height="2" rx="1" />
              <rect x="3" y="7" width="10" height="2" rx="1" />
              <rect x="3" y="12" width="10" height="2" rx="1" />
            </svg>
          </button>
          <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
          {list.googleMapsUrl && (
            <a
              href={list.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Google Maps"
              className="text-gray-300 hover:text-violet-500 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
        <button
          onClick={() => onRemove(list.id)}
          className="text-red-400 hover:text-red-600 text-xs"
        >
          Remove
        </button>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <EmojiPicker
          value={list.emoji}
          onChange={(emoji) => onUpdate(list.id, { emoji })}
          size="sm"
        />
        <input
          value={list.name}
          onChange={(e) => onUpdate(list.id, { name: e.target.value })}
          placeholder="List name"
          className={`flex-1 w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow text-sm placeholder-gray-400`}
        />
      </div>

      <input
        value={list.googleMapsUrl}
        onChange={(e) => onUpdate(list.id, { googleMapsUrl: e.target.value })}
        placeholder="Google Maps share link"
        className={`mb-3 w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow text-sm placeholder-gray-400`}
      />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <select
          value={list.category}
          onChange={(e) => onUpdate(list.id, { category: e.target.value })}
          style={{ colorScheme: "light" }}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow text-sm"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={list.placeCount || ""}
          onChange={(e) => onUpdate(list.id, { placeCount: parseInt(e.target.value) || 0 })}
          placeholder="# places (optional)"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow text-sm placeholder-gray-400"
        />
      </div>

      <input
        value={list.description}
        onChange={(e) => onUpdate(list.id, { description: e.target.value })}
        placeholder="Short description (optional)"
        className={`mb-3 w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-shadow text-sm placeholder-gray-400`}
      />

      {/* Per-card style */}
      <div>
        <label className="text-[11px] text-gray-400 mb-1 block">
          Card style (leave empty for global)
        </label>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => onUpdate(list.id, { cardBg: undefined })}
            className={`px-2 py-1 rounded text-[11px] border transition-all ${
              !list.cardBg
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            Global
          </button>
          {CARD_BG_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onUpdate(list.id, { cardBg: opt.id })}
              className={`px-2 py-1 rounded text-[11px] border transition-all ${
                list.cardBg === opt.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
