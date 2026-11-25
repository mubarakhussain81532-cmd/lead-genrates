import { z } from "zod";

export const enquiryServices = [
  "B2B Marketing Database",
  "Lead Generation",
  "Data Conversion",
  "Data Enhancement",
  "Back Office Support",
  "Sales Process Support",
  "Inbound & Outbound Campaigns",
  "Other",
] as const;

export const enquiryStatuses = [
  "new",
  "in_progress",
  "qualified",
  "converted",
  "closed",
  "spam",
] as const;

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(25, "Phone number is too long.")
  .regex(/^\+?[0-9][0-9\s().-]*$/, "Enter a valid phone number.");

export const enquirySchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    phone: phoneSchema,
    company: z.string().trim().max(120).optional().default(""),
    service: z.enum(enquiryServices),
    message: z.string().trim().min(10, "Add a little more detail.").max(2000),
    website: z.string().max(0).optional(),
  })
  .strict();

export const enquiryStatusSchema = z
  .object({
    status: z.enum(enquiryStatuses),
  })
  .strict();

export type EnquiryInput = Omit<z.output<typeof enquirySchema>, "website">;
