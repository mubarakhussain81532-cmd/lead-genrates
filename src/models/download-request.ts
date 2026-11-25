import { model, models, Schema, type Model } from "mongoose";
import type { DownloadRequestSubmission } from "@/types/submissions";

const downloadRequestSchema = new Schema<DownloadRequestSubmission>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    company: { type: String, required: true },
    productId: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

downloadRequestSchema.index({ createdAt: -1 });
downloadRequestSchema.index({ productId: 1, createdAt: -1 });
downloadRequestSchema.index({ email: 1, createdAt: -1 });

export const DownloadRequestModel =
  (models.DownloadRequest as Model<DownloadRequestSubmission> | undefined) ??
  model<DownloadRequestSubmission>(
    "DownloadRequest",
    downloadRequestSchema,
    "downloadRequests",
  );
