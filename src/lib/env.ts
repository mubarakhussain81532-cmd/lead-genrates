import "server-only";

import { z } from "zod";

const objectStorageEnvSchema = z.object({
  S3_BUCKET: z.string().min(1),
  S3_REGION: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_ENDPOINT: z.string().url().optional(),
  S3_FORCE_PATH_STYLE: z.enum(["true", "false"]).default("false"),
});

const smtpEnvSchema = z.object({
  SMTP_HOST: z.string().trim().min(1).max(253),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_SECURE: z.enum(["true", "false"]).default("false"),
  SMTP_REQUIRE_TLS: z.enum(["true", "false"]).default("true"),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM: z.string().trim().email().max(254),
  ENQUIRY_NOTIFICATION_TO: z.string().trim().email().max(254),
});

export function getSmtpEnv() {
  const parsed = smtpEnvSchema.parse({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE || "false",
    SMTP_REQUIRE_TLS: process.env.SMTP_REQUIRE_TLS || "true",
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    ENQUIRY_NOTIFICATION_TO: process.env.ENQUIRY_NOTIFICATION_TO,
  });

  const config = {
    host: parsed.SMTP_HOST,
    port: parsed.SMTP_PORT,
    secure: parsed.SMTP_SECURE === "true",
    requireTLS: parsed.SMTP_REQUIRE_TLS === "true",
    user: parsed.SMTP_USER,
    password: parsed.SMTP_PASSWORD,
    from: parsed.SMTP_FROM,
    notificationTo: parsed.ENQUIRY_NOTIFICATION_TO,
  };

  if (
    process.env.NODE_ENV === "production" &&
    !config.secure &&
    !config.requireTLS
  ) {
    throw new Error("SMTP must use TLS in production.");
  }

  return config;
}

export function getDownloadTokenSecret(): string {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("DOWNLOAD_TOKEN_SECRET must be at least 32 characters.");
  }
  return secret;
}

export function getObjectStorageEnv() {
  return objectStorageEnvSchema.parse({
    S3_BUCKET: process.env.S3_BUCKET,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_ENDPOINT: process.env.S3_ENDPOINT || undefined,
    S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE || "false",
  });
}
