import { Collection, MapList } from "./types";
import { put, list as blobList } from "@vercel/blob";
import { nanoid } from "nanoid";

const BLOB_PATH = "collections.json";

// In-memory cache: prevents stale reads overwriting data and speeds up repeated reads.
// Each serverless instance maintains its own cache; writes update it synchronously before blob upload.
let collectionsCache: Collection[] | null = null;

async function readCollections(): Promise<Collection[]> {
  if (collectionsCache !== null) return collectionsCache;

  const { blobs } = await blobList({ prefix: BLOB_PATH });
  if (blobs.length === 0) {
    collectionsCache = [];
    return [];
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const response = await fetch(blobs[0].url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as Collection[];
  collectionsCache = data;
  return data;
}

async function writeCollections(collections: readonly Collection[]): Promise<void> {
  // Update cache immediately so subsequent reads in the same instance see the new data.
  collectionsCache = [...collections];
  await put(BLOB_PATH, JSON.stringify(collections, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getCollections(): Promise<readonly Collection[]> {
  const collections = await readCollections();
  // Deduplicate by slug, keeping the most recently updated entry.
  const seen = new Map<string, Collection>();
  for (const c of collections) {
    const existing = seen.get(c.slug);
    if (!existing || c.updatedAt > existing.updatedAt) {
      seen.set(c.slug, c);
    }
  }
  return [...seen.values()];
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  const collections = await readCollections();
  return collections.find((c) => c.slug === slug);
}

export async function saveCollection(
  collection: Omit<Collection, "id" | "createdAt" | "updatedAt">
): Promise<Collection> {
  const collections = await readCollections();
  const now = new Date().toISOString();
  const newCollection: Collection = {
    ...collection,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
  };
  await writeCollections([...collections, newCollection]);
  return newCollection;
}

export async function updateCollection(
  id: string,
  data: Partial<Omit<Collection, "id" | "createdAt">>
): Promise<Collection | undefined> {
  const collections = await readCollections();
  const index = collections.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const updated: Collection = {
    ...collections[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await writeCollections(collections.map((c, i) => (i === index ? updated : c)));
  return updated;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const collections = await readCollections();
  const filtered = collections.filter((c) => c.id !== id);
  if (filtered.length === collections.length) return false;
  await writeCollections(filtered);
  return true;
}

export function createMapList(data: Omit<MapList, "id">): MapList {
  return { ...data, id: nanoid() };
}
