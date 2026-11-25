import { model, models, Schema, type Model } from "mongoose";
import type { ServiceRecord } from "@/types/local-store";
import { serviceIconNames } from "@/lib/service-icon-names";

const serviceSchema = new Schema<ServiceRecord>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, trim: true },
    icon: { type: String, enum: serviceIconNames, required: true },
    isActive: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

serviceSchema.index({ slug: 1 }, { unique: true });
serviceSchema.index({ isActive: 1, createdAt: -1 });

export const ServiceModel =
  (models.Service as Model<ServiceRecord> | undefined) ??
  model<ServiceRecord>("Service", serviceSchema, "services");
