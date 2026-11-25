import assert from "node:assert/strict";
import { connectToDatabase, usesMongoDatabase } from "../src/lib/mongodb";
import { getSiteUrl } from "../src/lib/site-url";
import { AdminModel } from "../src/models/admin";
import { AdminSessionModel } from "../src/models/admin-session";
import { ContactModel, EnquiryModel } from "../src/models/enquiry";
import { NewsletterModel } from "../src/models/newsletter";
import { ProductModel } from "../src/models/product";
import { RateLimitModel } from "../src/models/rate-limit";
import { ServiceModel } from "../src/models/service";

const environmentKeys = [
  "MONGODB_URI",
  "NODE_ENV",
  "SITE_URL",
  "VERCEL_ENV",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;
const originalEnvironment = new Map(
  environmentKeys.map((key) => [key, process.env[key]]),
);

function setEnvironment(key: string, value: string | undefined) {
  if (value === undefined) {
    Reflect.deleteProperty(process.env, key);
  } else {
    Reflect.set(process.env, key, value);
  }
}

function hasIndex(
  indexes: ReturnType<typeof ProductModel.schema.indexes>,
  key: string,
  expected: Record<string, unknown> = {},
): boolean {
  return indexes.some(
    ([keys, options]) =>
      key in keys &&
      Object.entries(expected).every(
        ([name, value]) =>
          (options as Record<string, unknown>)[name] === value,
      ),
  );
}

async function main() {
  try {
    for (const key of environmentKeys) {
      setEnvironment(key, undefined);
    }

    setEnvironment("NODE_ENV", "development");
    assert.equal(usesMongoDatabase(), false);
    assert.equal(getSiteUrl().origin, "http://localhost:3000");

    setEnvironment(
      "VERCEL_PROJECT_PRODUCTION_URL",
      "production.example.com",
    );
    setEnvironment("VERCEL_ENV", "production");
    setEnvironment("NODE_ENV", "production");
    assert.equal(getSiteUrl().origin, "https://production.example.com");

    setEnvironment("SITE_URL", "https://custom.example.com");
    assert.equal(getSiteUrl().origin, "https://custom.example.com");
    setEnvironment("SITE_URL", "http://custom.example.com");
    assert.throws(() => getSiteUrl(), /must use HTTPS/);

    setEnvironment("MONGODB_URI", undefined);
    await assert.rejects(
      connectToDatabase(),
      /MONGODB_URI must be configured/,
    );
    assert.equal(usesMongoDatabase(), true);
    setEnvironment("NODE_ENV", "development");
    assert.equal(usesMongoDatabase(), false);

    assert.equal(
      hasIndex(ProductModel.schema.indexes(), "name", { unique: true }),
      true,
    );
    assert.equal(
      hasIndex(ServiceModel.schema.indexes(), "slug", { unique: true }),
      true,
    );
    assert.equal(
      hasIndex(AdminModel.schema.indexes(), "email", { unique: true }),
      true,
    );
    assert.equal(
      hasIndex(NewsletterModel.schema.indexes(), "email", { unique: true }),
      true,
    );
    assert.equal(
      hasIndex(EnquiryModel.schema.indexes(), "status"),
      true,
    );
    assert.equal(
      hasIndex(ContactModel.schema.indexes(), "status"),
      true,
    );
    assert.equal(
      hasIndex(AdminSessionModel.schema.indexes(), "expiresAt", {
        expireAfterSeconds: 0,
      }),
      true,
    );
    assert.equal(
      hasIndex(RateLimitModel.schema.indexes(), "expiresAt", {
        expireAfterSeconds: 0,
      }),
      true,
    );

    console.info("MongoDB configuration, URL fallback, and indexes passed.");
  } finally {
    for (const [key, value] of originalEnvironment) {
      if (value === undefined) {
        setEnvironment(key, undefined);
      } else {
        setEnvironment(key, value);
      }
    }
  }
}

main().catch((error: unknown) => {
  console.error(
    "Database checks failed.",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
