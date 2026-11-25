import { model, models, Schema, type Model } from "mongoose";
import type { AdminRecord } from "@/types/local-store";
import { adminRoles } from "@/types/admin";

const adminSchema = new Schema<AdminRecord>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: adminRoles, required: true },
    isActive: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ isActive: 1, role: 1 });

export const AdminModel =
  (models.Admin as Model<AdminRecord> | undefined) ??
  model<AdminRecord>("Admin", adminSchema, "admins");
