import { z } from "zod";
import { adminRoles } from "@/types/admin";
import { serviceIconNames } from "@/lib/service-icons";

export const adminLoginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export const adminRoleSchema = z.enum(adminRoles);

export const uploadTicketSchema = z
  .object({
    contentType: z.string().trim().min(1).max(120),
    size: z.number().int().positive().max(20 * 1024 * 1024),
  })
  .strict();

export const uploadCompletionSchema = z
  .object({
    kind: z.enum(["image", "sample"]),
    key: z.string().trim().min(1).max(240),
    contentType: z.string().trim().min(1).max(120),
    size: z.number().int().positive().max(20 * 1024 * 1024),
  })
  .strict();

export const serviceInputSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(1200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    icon: z.enum(serviceIconNames),
    isActive: z.boolean().default(true),
  })
  .strict();

export const serviceUpdateSchema = serviceInputSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one service field is required.",
  });

const officeSchema = z
  .object({
    title: z.string().trim().min(2).max(80),
    address: z.string().trim().min(2).max(200),
    city: z.string().trim().min(2).max(120),
  })
  .strict();

const faqItemSchema = z
  .object({
    question: z.string().trim().min(5).max(240),
    answer: z.string().trim().min(5).max(1600),
  })
  .strict();

const testimonialSchema = z
  .object({
    quote: z.string().trim().min(10).max(1200),
    name: z.string().trim().min(2).max(100),
    role: z.string().trim().min(2).max(100),
  })
  .strict();

export const siteContentSchema = z
  .object({
    contact: z
      .object({
        phone: z.string().trim().min(7).max(25),
        email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
        offices: z.array(officeSchema).min(1).max(5),
      })
      .strict(),
    faqs: z.array(faqItemSchema).min(1).max(20),
    testimonials: z.array(testimonialSchema).min(1).max(8),
  })
  .strict();
