import type { EnquiryStatus } from "@/types/local-store";

export type EnquirySubmission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  status: EnquiryStatus;
  createdAt: Date;
};

export type DownloadRequestSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  productId: string;
  createdAt: Date;
};

export type NewsletterSubscription = {
  id: string;
  email: string;
  createdAt: Date;
};

export type SubmissionCollections = {
  enquiries: EnquirySubmission;
  contact: EnquirySubmission;
  "download-requests": DownloadRequestSubmission;
  newsletter: NewsletterSubscription;
};

export type SubmissionCollectionName = keyof SubmissionCollections;
