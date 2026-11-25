import { z } from "zod";
import {
  enquiryServices,
  enquiryStatuses,
} from "@/utils/enquiry-schema";
import type { SubmissionCollections } from "@/types/submissions";

const recordIdSchema = z.string().min(1).max(128);
const createdAtSchema = z.coerce.date();

export const enquirySubmissionSchema: z.ZodType<
  SubmissionCollections["enquiries"]
> = z.object({
  id: recordIdSchema,
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(7).max(25),
  company: z.string().max(120),
  service: z.enum(enquiryServices),
  message: z.string().min(10).max(2000),
  status: z.enum(enquiryStatuses),
  createdAt: createdAtSchema,
}).strict();

export const downloadRequestSubmissionSchema: z.ZodType<
  SubmissionCollections["download-requests"]
> = z.object({
  id: recordIdSchema,
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(7).max(25),
  company: z.string().max(120),
  productId: z.string().regex(/^[a-f\d]{24}$/i),
  createdAt: createdAtSchema,
}).strict();

export const newsletterSubscriptionSchema: z.ZodType<
  SubmissionCollections["newsletter"]
> = z.object({
  id: recordIdSchema,
  email: z.string().email().max(254),
  createdAt: createdAtSchema,
}).strict();
