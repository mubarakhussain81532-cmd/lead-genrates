import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { LocalStore } from "@/types/local-store";

const storeDirectory = join(process.cwd(), ".local-data");
const storePath = join(storeDirectory, "store.json");
const dateFields = new Set(["createdAt", "updatedAt", "expiresAt"]);
let writeQueue: Promise<void> = Promise.resolve();

function assertDevelopmentStorage() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Local JSON storage is available only in development.");
  }
}

function emptyStore(): LocalStore {
  return {
    version: 1,
    enquiries: [],
    products: [],
    downloadRequests: [],
    admins: [],
    adminSessions: [],
    services: [],
    siteContent: null,
    rateLimits: [],
  };
}

function parseStore(contents: string): LocalStore {
  const parsed = JSON.parse(contents, (key, value: unknown) =>
    dateFields.has(key) && typeof value === "string" ? new Date(value) : value,
  ) as Partial<LocalStore>;

  if (!parsed || parsed.version !== 1) {
    throw new Error("The local JSON store has an unsupported format.");
  }

  const defaults = emptyStore();
  for (const key of [
    "enquiries",
    "products",
    "downloadRequests",
    "admins",
    "adminSessions",
    "services",
    "rateLimits",
  ] as const) {
    if (parsed[key] !== undefined && !Array.isArray(parsed[key])) {
      throw new Error(`The local JSON store collection "${key}" is invalid.`);
    }
  }

  return { ...defaults, ...parsed };
}

async function readStoreFromDisk(): Promise<LocalStore> {
  try {
    return parseStore(await readFile(storePath, "utf8"));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return emptyStore();
    }
    throw error;
  }
}

async function writeStoreToDisk(store: LocalStore): Promise<void> {
  await mkdir(storeDirectory, { recursive: true, mode: 0o700 });
  const temporaryPath = `${storePath}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;

  try {
    await writeFile(temporaryPath, JSON.stringify(store, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(temporaryPath, storePath);
  } finally {
    await unlink(temporaryPath).catch((error: unknown) => {
      if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== "ENOENT"
      ) {
        throw error;
      }
    });
  }
}

export async function readLocalStore(): Promise<LocalStore> {
  assertDevelopmentStorage();
  return readStoreFromDisk();
}

export async function updateLocalStore<T>(
  update: (store: LocalStore) => T | Promise<T>,
): Promise<T> {
  assertDevelopmentStorage();
  const previousWrite = writeQueue;
  let releaseWrite!: () => void;
  writeQueue = new Promise<void>((resolve) => {
    releaseWrite = resolve;
  });
  await previousWrite;

  try {
    const store = await readStoreFromDisk();
    const result = await update(store);
    await writeStoreToDisk(store);
    return result;
  } finally {
    releaseWrite();
  }
}

export function createLocalId(): string {
  return randomBytes(12).toString("hex");
}

export function isLocalId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

export class DuplicateLocalRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateLocalRecordError";
  }
}
