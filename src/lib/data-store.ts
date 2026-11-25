import "server-only";

import type {
  AdminRecord,
  ProductRecord,
  ServiceRecord,
  SiteContentRecord,
} from "@/types/local-store";
import type {
  EnquirySubmission,
  SubmissionCollectionName,
  SubmissionCollections,
} from "@/types/submissions";
import type { EnquiryStatus } from "@/types/local-store";
import {
  DuplicateLocalRecordError,
  readLocalStore,
  updateLocalStore,
} from "@/lib/local-json-store";
import {
  readSubmissionRecords as readLocalSubmissions,
  updateSubmissionRecords as updateLocalSubmissions,
} from "@/lib/submission-json-store";
import { connectToDatabase, usesMongoDatabase } from "@/lib/mongodb";
import { AdminModel } from "@/models/admin";
import { AdminSessionModel } from "@/models/admin-session";
import { ContactModel, EnquiryModel } from "@/models/enquiry";
import { DownloadRequestModel } from "@/models/download-request";
import { NewsletterModel } from "@/models/newsletter";
import { ProductModel } from "@/models/product";
import { ServiceModel } from "@/models/service";
import { SiteContentModel } from "@/models/site-content";
import { DuplicateRecordError } from "@/lib/duplicate-record";

function assertDuplicate(error: unknown, message: string): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    throw new DuplicateRecordError(message);
  }
  throw error;
}

export async function readProductRecords(): Promise<ProductRecord[]> {
  if (!usesMongoDatabase()) {
    return (await readLocalStore()).products;
  }
  await connectToDatabase();
  return ProductModel.find().sort({ createdAt: -1 }).lean().exec();
}

export async function findProductById(
  id: string,
): Promise<ProductRecord | null> {
  if (!usesMongoDatabase()) {
    return (
      (await readLocalStore()).products.find((item) => item._id === id) ?? null
    );
  }
  await connectToDatabase();
  return ProductModel.findById(id).lean().exec();
}

export async function createProductRecord(
  record: ProductRecord,
): Promise<ProductRecord> {
  if (!usesMongoDatabase()) {
    return updateLocalStore((store) => {
      if (store.products.some((item) => item.name === record.name)) {
        throw new DuplicateLocalRecordError("Duplicate product name.");
      }
      store.products.push(record);
      return record;
    });
  }
  await connectToDatabase();
  try {
    return await ProductModel.create(record).then((item) => item.toObject());
  } catch (error) {
    return assertDuplicate(error, "Duplicate product name.");
  }
}

export async function updateProductRecord(
  id: string,
  updates: Partial<Omit<ProductRecord, "_id" | "createdAt">>,
): Promise<ProductRecord | null> {
  if (!usesMongoDatabase()) {
    return updateLocalStore((store) => {
      const item = store.products.find((record) => record._id === id);
      if (!item) {
        return null;
      }
      if (
        updates.name &&
        store.products.some(
          (record) => record._id !== id && record.name === updates.name,
        )
      ) {
        throw new DuplicateLocalRecordError("Duplicate product name.");
      }
      Object.assign(item, updates);
      return item;
    });
  }
  await connectToDatabase();
  try {
    return await ProductModel.findByIdAndUpdate(id, { $set: updates }, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  } catch (error) {
    return assertDuplicate(error, "Duplicate product name.");
  }
}

export async function deactivateProductRecord(
  id: string,
): Promise<ProductRecord | null> {
  return updateProductRecord(id, { isActive: false });
}

export async function readServiceRecords(): Promise<ServiceRecord[]> {
  if (!usesMongoDatabase()) {
    return (await readLocalStore()).services;
  }
  await connectToDatabase();
  return ServiceModel.find().sort({ createdAt: -1 }).lean().exec();
}

export async function createServiceRecord(
  record: ServiceRecord,
): Promise<ServiceRecord> {
  if (!usesMongoDatabase()) {
    return updateLocalStore((store) => {
      if (store.services.some((item) => item.slug === record.slug)) {
        throw new DuplicateLocalRecordError("Duplicate service slug.");
      }
      store.services.push(record);
      return record;
    });
  }
  await connectToDatabase();
  try {
    return await ServiceModel.create(record).then((item) => item.toObject());
  } catch (error) {
    return assertDuplicate(error, "Duplicate service slug.");
  }
}

export async function updateServiceRecord(
  id: string,
  updates: Partial<Omit<ServiceRecord, "_id" | "createdAt">>,
): Promise<ServiceRecord | null> {
  if (!usesMongoDatabase()) {
    return updateLocalStore((store) => {
      const item = store.services.find((record) => record._id === id);
      if (!item) {
        return null;
      }
      if (
        updates.slug &&
        store.services.some(
          (record) => record._id !== id && record.slug === updates.slug,
        )
      ) {
        throw new DuplicateLocalRecordError("Duplicate service slug.");
      }
      Object.assign(item, updates, { updatedAt: new Date() });
      return item;
    });
  }
  await connectToDatabase();
  try {
    return await ServiceModel.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
  } catch (error) {
    return assertDuplicate(error, "Duplicate service slug.");
  }
}

export async function deactivateServiceRecord(
  id: string,
): Promise<ServiceRecord | null> {
  return updateServiceRecord(id, { isActive: false });
}

export async function readSiteContentRecord(): Promise<SiteContentRecord | null> {
  if (!usesMongoDatabase()) {
    return (await readLocalStore()).siteContent;
  }
  await connectToDatabase();
  return SiteContentModel.findById("public").lean().exec();
}

export async function writeSiteContentRecord(
  record: SiteContentRecord,
): Promise<SiteContentRecord> {
  if (!usesMongoDatabase()) {
    return updateLocalStore((store) => {
      store.siteContent = record;
      return record;
    });
  }
  await connectToDatabase();
  return SiteContentModel.findByIdAndUpdate(
    "public",
    { $set: record },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
    .lean()
    .orFail()
    .exec();
}

export function readSubmissionRecords(
  collection: "enquiries",
): Promise<SubmissionCollections["enquiries"][]>;
export function readSubmissionRecords(
  collection: "contact",
): Promise<SubmissionCollections["contact"][]>;
export function readSubmissionRecords(
  collection: "download-requests",
): Promise<SubmissionCollections["download-requests"][]>;
export function readSubmissionRecords(
  collection: "newsletter",
): Promise<SubmissionCollections["newsletter"][]>;
export async function readSubmissionRecords(
  collection: SubmissionCollectionName,
): Promise<
  | SubmissionCollections["enquiries"][]
  | SubmissionCollections["contact"][]
  | SubmissionCollections["download-requests"][]
  | SubmissionCollections["newsletter"][]
> {
  if (!usesMongoDatabase()) {
    return readLocalSubmissions(collection);
  }
  await connectToDatabase();
  switch (collection) {
    case "enquiries":
      return EnquiryModel.find().sort({ createdAt: -1 }).lean().exec();
    case "contact":
      return ContactModel.find().sort({ createdAt: -1 }).lean().exec();
    case "download-requests":
      return DownloadRequestModel.find().sort({ createdAt: -1 }).lean().exec();
    case "newsletter":
      return NewsletterModel.find().sort({ createdAt: -1 }).lean().exec();
  }
}

export function createSubmissionRecord(
  collection: "enquiries" | "contact",
  record: EnquirySubmission,
): Promise<void>;
export function createSubmissionRecord(
  collection: "download-requests",
  record: SubmissionCollections["download-requests"],
): Promise<void>;
export function createSubmissionRecord(
  collection: "newsletter",
  record: SubmissionCollections["newsletter"],
): Promise<void>;
export async function createSubmissionRecord(
  collection: SubmissionCollectionName,
  record:
    | SubmissionCollections["enquiries"]
    | SubmissionCollections["contact"]
    | SubmissionCollections["download-requests"]
    | SubmissionCollections["newsletter"],
): Promise<void> {
  if (!usesMongoDatabase()) {
    await updateLocalSubmissions(collection, (records) => {
      records.push(record);
    });
    return;
  }
  await connectToDatabase();
  switch (collection) {
    case "enquiries":
      await EnquiryModel.create(record);
      return;
    case "contact":
      await ContactModel.create(record);
      return;
    case "download-requests":
      await DownloadRequestModel.create(record);
      return;
    case "newsletter":
      await NewsletterModel.create(record);
      return;
  }
}

export async function updateEnquiryStatusRecord(
  collection: "contact" | "enquiries",
  id: string,
  status: EnquiryStatus,
): Promise<EnquirySubmission | null> {
  if (!usesMongoDatabase()) {
    return updateLocalSubmissions(collection, (records) => {
      const item = records.find((record) => record.id === id);
      if (item) {
        item.status = status;
      }
      return item ?? null;
    });
  }
  await connectToDatabase();
  const model = collection === "contact" ? ContactModel : EnquiryModel;
  return model
    .findOneAndUpdate({ id }, { $set: { status } }, { new: true })
    .lean()
    .exec();
}

export async function deleteEnquiryRecord(
  collection: "contact" | "enquiries",
  id: string,
): Promise<EnquirySubmission | null> {
  if (!usesMongoDatabase()) {
    return updateLocalSubmissions(collection, (records) => {
      const index = records.findIndex((record) => record.id === id);
      return index < 0 ? null : records.splice(index, 1)[0];
    });
  }
  await connectToDatabase();
  const model = collection === "contact" ? ContactModel : EnquiryModel;
  return model.findOneAndDelete({ id }).lean().exec();
}

export async function subscribeNewsletter(
  record: SubmissionCollections["newsletter"],
): Promise<void> {
  if (!usesMongoDatabase()) {
    await updateLocalSubmissions("newsletter", (records) => {
      if (!records.some((item) => item.email === record.email)) {
        records.push(record);
      }
    });
    return;
  }
  await connectToDatabase();
  try {
    await NewsletterModel.updateOne(
      { email: record.email },
      { $setOnInsert: record },
      { upsert: true },
    ).exec();
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      error.code !== 11000
    ) {
      throw error;
    }
  }
}

export async function findAdminByEmail(
  email: string,
): Promise<AdminRecord | null> {
  if (!usesMongoDatabase()) {
    return (
      (await readLocalStore()).admins.find((item) => item.email === email) ?? null
    );
  }
  await connectToDatabase();
  return AdminModel.findOne({ email }).select("+passwordHash").lean().exec();
}

export async function createAdminRecord(record: AdminRecord): Promise<void> {
  if (!usesMongoDatabase()) {
    await updateLocalStore((store) => {
      if (store.admins.some((item) => item.email === record.email)) {
        throw new DuplicateLocalRecordError(
          "An administrator already uses that email address.",
        );
      }
      store.admins.push(record);
    });
    return;
  }
  await connectToDatabase();
  try {
    await AdminModel.create(record);
  } catch (error) {
    return assertDuplicate(
      error,
      "An administrator already uses that email address.",
    );
  }
}

export async function createAdminSessionRecord(
  record: {
    _id: string;
    adminId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  },
): Promise<AdminRecord | null> {
  if (!usesMongoDatabase()) {
    return updateLocalStore((store) => {
      const admin = store.admins.find(
        (item) => item._id === record.adminId && item.isActive,
      );
      if (!admin) {
        return null;
      }
      store.adminSessions.push(record);
      return admin;
    });
  }
  await connectToDatabase();
  const admin = await AdminModel.findOne({
    _id: record.adminId,
    isActive: true,
  })
    .lean()
    .exec();
  if (!admin) {
    return null;
  }
  await AdminSessionModel.create(record);
  return admin;
}

export async function findAdminBySessionTokenHash(
  tokenHash: string,
  now: Date,
): Promise<{ admin: AdminRecord; sessionId: string } | null> {
  if (!usesMongoDatabase()) {
    const store = await readLocalStore();
    const session = store.adminSessions.find(
      (item) => item.tokenHash === tokenHash && item.expiresAt > now,
    );
    if (!session) {
      return null;
    }
    const admin = store.admins.find(
      (item) => item._id === session.adminId && item.isActive,
    );
    return admin ? { admin, sessionId: session._id } : null;
  }
  await connectToDatabase();
  const session = await AdminSessionModel.findOne({
    tokenHash,
    expiresAt: { $gt: now },
  })
    .lean()
    .exec();
  if (!session) {
    return null;
  }
  const admin = await AdminModel.findOne({
    _id: session.adminId,
    isActive: true,
  })
    .lean()
    .exec();
  return admin ? { admin, sessionId: session._id } : null;
}

export async function revokeAdminSessionByTokenHash(
  tokenHash: string,
): Promise<void> {
  if (!usesMongoDatabase()) {
    await updateLocalStore((store) => {
      store.adminSessions = store.adminSessions.filter(
        (item) => item.tokenHash !== tokenHash,
      );
    });
    return;
  }
  await connectToDatabase();
  await AdminSessionModel.deleteOne({ tokenHash }).exec();
}

export async function removeAdminSessionById(id: string): Promise<void> {
  if (!usesMongoDatabase()) {
    await updateLocalStore((store) => {
      store.adminSessions = store.adminSessions.filter(
        (item) => item._id !== id,
      );
    });
    return;
  }
  await connectToDatabase();
  await AdminSessionModel.deleteOne({ _id: id }).exec();
}
