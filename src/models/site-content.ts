import { model, models, Schema, type Model } from "mongoose";
import type { SiteContentRecord } from "@/types/local-store";

const officeSchema = new Schema(
  {
    title: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
  },
  { _id: false },
);

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const testimonialSchema = new Schema(
  {
    quote: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false },
);

const siteContentSchema = new Schema<SiteContentRecord>(
  {
    _id: { type: String, required: true, enum: ["public"] },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      offices: { type: [officeSchema], required: true },
    },
    faqs: { type: [faqSchema], required: true },
    testimonials: { type: [testimonialSchema], required: true },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

export const SiteContentModel =
  (models.SiteContent as Model<SiteContentRecord> | undefined) ??
  model<SiteContentRecord>("SiteContent", siteContentSchema, "siteContent");
