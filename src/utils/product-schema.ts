import { z } from "zod";

const sampleKeySchema = z
  .string()
  .min(1)
  .max(512)
  .regex(
    /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/,
    "Sample file must be a valid private object key.",
  )
  .refine(
    (value) => value.split("/").every((part) => part !== "." && part !== ".."),
    "Sample file key cannot contain path traversal segments.",
  );

const productImageSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
  (value) =>
    (value.startsWith("/") && !value.startsWith("//")) ||
    /^products\/images\/[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(value),
  { message: "Image must be a local path or uploaded product image key." },
  );

export const productInputSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(2000),
    category: z.string().trim().min(2).max(80),
    image: productImageSchema,
    sampleFile: sampleKeySchema.nullable().optional(),
    isActive: z.boolean().default(true),
  })
  .strict();

export const productUpdateSchema = productInputSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one product field is required.",
  });

export const downloadRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(25)
      .regex(/^\+?[0-9][0-9\s().-]*$/, "Enter a valid phone number."),
    company: z.string().trim().max(120).optional().default(""),
    productId: z.string().regex(/^[a-f\d]{24}$/i, "Select a valid product."),
    website: z.string().max(0).optional(),
  })
  .strict();

export type ProductInput = z.output<typeof productInputSchema>;
export type ProductUpdateInput = z.output<typeof productUpdateSchema>;
export type DownloadRequestInput = Omit<
  z.output<typeof downloadRequestSchema>,
  "website"
>;
