import "server-only";

import { createPublicProductImageUrl } from "@/lib/object-storage";
import type {
  EnquiryRecord,
  ProductRecord,
  ServiceRecord,
} from "@/types/local-store";
import type { EnquirySubmission } from "@/types/submissions";

export function serializeEnquiry(enquiry: EnquiryRecord) {
  return {
    id: enquiry._id.toString(),
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    company: enquiry.company ?? "",
    service: enquiry.service,
    message: enquiry.message,
    status: enquiry.status,
    createdAt: enquiry.createdAt.toISOString(),
  };
}

export function serializeSubmissionEnquiry(enquiry: EnquirySubmission) {
  return {
    id: enquiry.id,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    company: enquiry.company,
    service: enquiry.service,
    message: enquiry.message,
    status: enquiry.status,
    createdAt: enquiry.createdAt.toISOString(),
  };
}

export async function serializePublicProduct(product: ProductRecord) {
  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    image: await createPublicProductImageUrl(product.image),
    sampleAvailable: Boolean(product.sampleFile),
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
  };
}

export async function serializeAdminProduct(product: ProductRecord) {
  return {
    ...(await serializePublicProduct(product)),
    isActive: product.isActive,
  };
}

export function serializeService(item: ServiceRecord) {
  return {
    id: item._id.toString(),
    title: item.title,
    description: item.description,
    slug: item.slug,
    icon: item.icon,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
  };
}
