import { Collection, MapList } from "./types";
import { put, list as blobList, getDownloadUrl } from "@vercel/blob";
import { nanoid } from "nanoid";

const BLOB_PATH = "collections.json";

async function readCollections(): Promise<Collection[]> {
  const { blobs } = await blobList({ prefix: BLOB_PATH });
  if (blobs.length === 0) return [];

  const signedUrl = await getDownloadUrl(blobs[0].url);
  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as Collection[];
}

async function writeCollections(collections: readonly Collection[]): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(collections, null, 2), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

export async function getCollections(): Promise<readonly Collection[]> {
  return readCollections();
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
