import { Collection, MapList } from "./types";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "collections.json");

async function ensureDataFile(): Promise<void> {
  try {
    await readFile(DATA_FILE, "utf-8");
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export async function getCollections(): Promise<readonly Collection[]> {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as Collection[];
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  const collections = await getCollections();
  return collections.find((c) => c.slug === slug);
}

export async function saveCollection(collection: Omit<Collection, "id" | "createdAt" | "updatedAt">): Promise<Collection> {
  const collections = await getCollections();
  const now = new Date().toISOString();
  const newCollection: Collection = {
    ...collection,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
  };
  const updated = [...collections, newCollection];
  await writeFile(DATA_FILE, JSON.stringify(updated, null, 2));
  return newCollection;
}

export async function updateCollection(
  id: string,
  data: Partial<Omit<Collection, "id" | "createdAt">>
): Promise<Collection | undefined> {
  const collections = await getCollections();
  const index = collections.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const updated: Collection = {
    ...collections[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  const newCollections = collections.map((c, i) => (i === index ? updated : c));
  await writeFile(DATA_FILE, JSON.stringify(newCollections, null, 2));
  return updated;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const collections = await getCollections();
  const filtered = collections.filter((c) => c.id !== id);
  if (filtered.length === collections.length) return false;
  await writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

export function createMapList(data: Omit<MapList, "id">): MapList {
  return { ...data, id: nanoid() };
}
