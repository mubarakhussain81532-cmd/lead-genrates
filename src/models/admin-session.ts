import { model, models, Schema, type Model } from "mongoose";
import type { AdminSessionRecord } from "@/types/local-store";

const adminSessionSchema = new Schema<AdminSessionRecord>(
  {
    _id: { type: String, required: true },
    adminId: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
adminSessionSchema.index({ adminId: 1, expiresAt: 1 });

export const AdminSessionModel =
  (models.AdminSession as Model<AdminSessionRecord> | undefined) ??
  model<AdminSessionRecord>("AdminSession", adminSessionSchema, "adminSessions");
