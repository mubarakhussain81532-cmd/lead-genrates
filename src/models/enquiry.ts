import { model, models, Schema, type Model } from "mongoose";
import { enquiryStatuses } from "@/utils/enquiry-schema";
import type { EnquirySubmission } from "@/types/submissions";

const enquirySchema = new Schema<EnquirySubmission>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    company: { type: String, required: true },
    service: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: enquiryStatuses, required: true, default: "new" },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ email: 1, createdAt: -1 });

const contactSchema = enquirySchema.clone();

export const EnquiryModel =
  (models.Enquiry as Model<EnquirySubmission> | undefined) ??
  model<EnquirySubmission>("Enquiry", enquirySchema, "enquiries");

export const ContactModel =
  (models.ContactSubmission as Model<EnquirySubmission> | undefined) ??
  model<EnquirySubmission>("ContactSubmission", contactSchema, "contacts");
