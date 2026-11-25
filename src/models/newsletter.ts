import { model, models, Schema, type Model } from "mongoose";
import type { NewsletterSubscription } from "@/types/submissions";

const newsletterSchema = new Schema<NewsletterSubscription>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

newsletterSchema.index({ email: 1 }, { unique: true });
newsletterSchema.index({ createdAt: -1 });

export const NewsletterModel =
  (models.Newsletter as Model<NewsletterSubscription> | undefined) ??
  model<NewsletterSubscription>("Newsletter", newsletterSchema, "newsletter");
