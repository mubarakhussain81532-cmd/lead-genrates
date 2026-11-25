import { model, models, Schema, type Model } from "mongoose";
import type { RateLimitRecord } from "@/types/local-store";

const rateLimitSchema = new Schema<RateLimitRecord>(
  {
    key: { type: String, required: true, unique: true },
    hits: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
);

rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitModel =
  (models.RateLimit as Model<RateLimitRecord> | undefined) ??
  model<RateLimitRecord>("RateLimit", rateLimitSchema, "rateLimits");
