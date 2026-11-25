import "server-only";

import { connection } from "next/server";
import { defaultSiteContent } from "@/lib/default-site-content";
import { getServiceIcon } from "@/lib/service-icons";
import { services, type ServiceItem } from "@/lib/marketing-content";
import type { SiteContentData } from "@/lib/default-site-content";
import { readServiceRecords, readSiteContentRecord } from "@/lib/data-store";

function logPublicDataFallback(resource: string, error: unknown) {
  const detail =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : "Unknown error";

  console.warn(`${resource} unavailable; rendering defaults.`, detail);
}

export async function getPublicSiteContent(): Promise<SiteContentData> {
  await connection();
  try {
    const item = await readSiteContentRecord();
    return {
      contact: {
        phone: item?.contact?.phone ?? defaultSiteContent.contact.phone,
        email: item?.contact?.email ?? defaultSiteContent.contact.email,
        offices:
          item?.contact?.offices?.map((office) => ({
            title: office.title,
            address: office.address,
            city: office.city,
          })) ?? defaultSiteContent.contact.offices,
      },
      faqs:
        item?.faqs?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })) ?? defaultSiteContent.faqs,
      testimonials:
        item?.testimonials?.map((testimonial) => ({
          quote: testimonial.quote,
          name: testimonial.name,
          role: testimonial.role,
        })) ?? defaultSiteContent.testimonials,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    logPublicDataFallback("Public site content", error);
    return defaultSiteContent;
  }
}

export async function getPublicServices(): Promise<ServiceItem[]> {
  await connection();
  try {
    const allServices = await readServiceRecords();
    const items = allServices
      .filter((item) => item.isActive)
      .sort(
        (left, right) =>
          left.createdAt.getTime() - right.createdAt.getTime() ||
          left._id.localeCompare(right._id),
      );
    if (items.length) {
      return items.map((item) => ({
        title: item.title,
        description: item.description,
        slug: item.slug,
        iconName: item.icon,
        icon: getServiceIcon(item.icon),
      }));
    }
    if (allServices.length > 0) {
      return [];
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    logPublicDataFallback("Public services", error);
  }

  return services;
}
