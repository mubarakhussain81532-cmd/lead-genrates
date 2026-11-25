import type { SiteContentData } from "@/lib/default-site-content";
import type { AdminRole } from "@/types/admin";
import type { enquiryStatuses } from "@/utils/enquiry-schema";
import type { serviceIconNames } from "@/lib/service-icon-names";

export type EnquiryStatus = (typeof enquiryStatuses)[number];
export type ServiceIconName = (typeof serviceIconNames)[number];

export type EnquiryRecord = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  status: EnquiryStatus;
  createdAt: Date;
};

export type ProductRecord = {
  _id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sampleFile: string | null;
  isActive: boolean;
  createdAt: Date;
};

export type DownloadRequestRecord = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  productId: string;
  createdAt: Date;
};

export type AdminRecord = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
};

export type AdminSessionRecord = {
  _id: string;
  adminId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
};

export type ServiceRecord = {
  _id: string;
  title: string;
  description: string;
  slug: string;
  icon: ServiceIconName;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SiteContentRecord = SiteContentData & {
  _id: "public";
  updatedAt: Date;
};

export type RateLimitRecord = {
  key: string;
  hits: number;
  expiresAt: Date;
};

export type LocalStore = {
  version: 1;
  enquiries: EnquiryRecord[];
  products: ProductRecord[];
  downloadRequests: DownloadRequestRecord[];
  admins: AdminRecord[];
  adminSessions: AdminSessionRecord[];
  services: ServiceRecord[];
  siteContent: SiteContentRecord | null;
  rateLimits: RateLimitRecord[];
};
