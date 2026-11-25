import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  readLocalStore,
} from "@/lib/local-json-store";
import type {
  SubmissionCollectionName,
  SubmissionCollections,
} from "@/types/submissions";
import {
  downloadRequestSubmissionSchema,
  enquirySubmissionSchema,
  newsletterSubscriptionSchema,
} from "@/utils/submission-record-schemas";
import type { z } from "zod";

const dataDirectory = join(process.cwd(), "data");
const collectionFiles: Record<SubmissionCollectionName, string> = {
  enquiries: "enquiries.json",
  contact: "contact.json",
  "download-requests": "download-requests.json",
  newsletter: "newsletter.json",
};
const collectionSchemas: {
  [K in SubmissionCollectionName]: z.ZodType<SubmissionCollections[K]>;
} = {
  enquiries: enquirySubmissionSchema,
  contact: enquirySubmissionSchema,
  "download-requests": downloadRequestSubmissionSchema,
  newsletter: newsletterSubscriptionSchema,
};

let initialization: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function assertDevelopmentStorage() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Local JSON storage is available only in development.");
  }
}

function collectionPath(collection: SubmissionCollectionName) {
  return join(dataDirectory, collectionFiles[collection]);
}

function parseRecords<K extends SubmissionCollectionName>(
  collection: K,
  contents: string,
): SubmissionCollections[K][] {
  if (!contents.trim()) {
    return [];
  }

  let value: unknown;
  try {
    value = JSON.parse(contents);
  } catch {
    throw new Error(`The local ${collection} JSON file contains invalid JSON.`);
  }

  if (!Array.isArray(value)) {
    throw new Error(`The local ${collection} JSON file must contain an array.`);
  }

  const parsed = collectionSchemas[collection].array().safeParse(value);
  if (!parsed.success) {
    throw new Error(`The local ${collection} JSON file contains invalid records.`);
  }

  const ids = new Set<string>();
  for (const record of parsed.data) {
    if (ids.has(record.id)) {
      throw new Error(`The local ${collection} JSON file contains duplicate IDs.`);
    }
    ids.add(record.id);
  }
  if (collection === "newsletter") {
    const emails = new Set<string>();
    for (const record of parsed.data) {
      const email = record.email.toLowerCase();
      if (emails.has(email)) {
        throw new Error("The local newsletter JSON file contains duplicate emails.");
      }
      emails.add(email);
    }
  }

  return parsed.data as SubmissionCollections[K][];
}

async function readCollection<K extends SubmissionCollectionName>(
  collection: K,
): Promise<SubmissionCollections[K][]> {
  try {
    return parseRecords(
      collection,
      await readFile(collectionPath(collection), "utf8"),
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      await writeCollection(collection, []);
      return [];
    }
    throw error;
  }
}

async function writeCollection<K extends SubmissionCollectionName>(
  collection: K,
  records: SubmissionCollections[K][],
): Promise<void> {
  const path = collectionPath(collection);
  const temporaryPath = `${path}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  const contents = JSON.stringify(records, null, 2);
  parseRecords(collection, contents);

  try {
    await writeFile(temporaryPath, contents, {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(temporaryPath, path);
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

function migrateLegacyEnquiries(
  records: Awaited<ReturnType<typeof readLocalStore>>["enquiries"],
): SubmissionCollections["enquiries"][] {
  return records.map((record) => ({
    id: record._id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    company: record.company,
    service: record.service,
    message: record.message,
    status: record.status,
    createdAt: record.createdAt,
  }));
}

function migrateLegacyDownloads(
  records: Awaited<ReturnType<typeof readLocalStore>>["downloadRequests"],
): SubmissionCollections["download-requests"][] {
  return records.map((record) => ({
    id: record._id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    company: record.company,
    productId: record.productId,
    createdAt: record.createdAt,
  }));
}

async function initializeCollections(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  const missing: SubmissionCollectionName[] = [];

  for (const collection of Object.keys(collectionFiles) as SubmissionCollectionName[]) {
    try {
      const contents = await readFile(collectionPath(collection), "utf8");
      parseRecords(collection, contents);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        missing.push(collection);
      } else {
        throw error;
      }
    }
  }

  if (missing.length === 0) {
    return;
  }

  const legacy = await readLocalStore();
  for (const collection of missing) {
    if (collection === "enquiries") {
      await writeCollection(collection, migrateLegacyEnquiries(legacy.enquiries));
    } else if (collection === "download-requests") {
      await writeCollection(
        collection,
        migrateLegacyDownloads(legacy.downloadRequests),
      );
    } else {
      await writeCollection(collection, []);
    }
  }
}

async function ensureInitialized(): Promise<void> {
  assertDevelopmentStorage();
  if (!initialization) {
    initialization = initializeCollections();
  }
  try {
    await initialization;
  } catch (error) {
    initialization = null;
    throw error;
  }
}

export function createSubmissionId(): string {
  return randomBytes(12).toString("hex");
}

export async function readSubmissionRecords<K extends SubmissionCollectionName>(
  collection: K,
): Promise<SubmissionCollections[K][]> {
  await ensureInitialized();
  return readCollection(collection);
}

export async function updateSubmissionRecords<
  K extends SubmissionCollectionName,
  TResult,
>(
  collection: K,
  update: (records: SubmissionCollections[K][]) => TResult | Promise<TResult>,
): Promise<TResult> {
  await ensureInitialized();

  const previousWrite = writeQueue;
  let releaseWrite!: () => void;
  writeQueue = new Promise<void>((resolve) => {
    releaseWrite = resolve;
  });
  await previousWrite;

  try {
    const records = await readCollection(collection);
    const result = await update(records);
    await writeCollection(collection, records);
    return result;
  } finally {
    releaseWrite();
  }
}
