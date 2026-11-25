import "server-only";

import mongoose from "mongoose";
import { AdminModel } from "@/models/admin";
import { AdminSessionModel } from "@/models/admin-session";
import { ContactModel, EnquiryModel } from "@/models/enquiry";
import { DownloadRequestModel } from "@/models/download-request";
import { NewsletterModel } from "@/models/newsletter";
import { ProductModel } from "@/models/product";
import { RateLimitModel } from "@/models/rate-limit";
import { ServiceModel } from "@/models/service";
import { SiteContentModel } from "@/models/site-content";

type MongoCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  mongoCache?: MongoCache;
};

const cache = (globalForMongo.mongoCache ??= {
  connection: null,
  promise: null,
});

export function usesMongoDatabase(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim()) || process.env.NODE_ENV === "production";
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI must be configured for production data access.");
  }

  if (cache.connection?.connection.readyState === 1) {
    return cache.connection;
  }

  if (cache.connection?.connection.readyState === 0) {
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then(async (connection) => {
        await Promise.all(
          [
            AdminModel,
            AdminSessionModel,
            ContactModel,
            DownloadRequestModel,
            EnquiryModel,
            NewsletterModel,
            ProductModel,
            RateLimitModel,
            ServiceModel,
            SiteContentModel,
          ].map((model) => model.init()),
        );
        cache.connection = connection;
        return connection;
      })
      .catch((error: unknown) => {
        cache.connection = null;
        cache.promise = null;
        throw error;
      });
  }

  return cache.promise;
}
