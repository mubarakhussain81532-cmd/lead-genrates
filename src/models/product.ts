import { model, models, Schema, type Model } from "mongoose";
import type { ProductRecord } from "@/types/local-store";

const productSchema = new Schema<ProductRecord>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    sampleFile: { type: String, default: null },
    isActive: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

productSchema.index({ name: 1 }, { unique: true });
productSchema.index({ isActive: 1, createdAt: -1 });

export const ProductModel =
  (models.Product as Model<ProductRecord> | undefined) ??
  model<ProductRecord>("Product", productSchema, "products");
