import "server-only";

import { apiError, apiSuccess } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { getSmtpEnv } from "@/lib/env";
import { sendEnquiryNotification } from "@/lib/enquiry-email";
import { parseJson } from "@/lib/parse-json";
import { createSubmissionRecord } from "@/lib/data-store";
import { createSubmissionId } from "@/lib/submission-json-store";
import type { EnquirySubmission } from "@/types/submissions";
import { enquirySchema } from "@/utils/enquiry-schema";
import type { SubmissionCollectionName } from "@/types/submissions";

export async function submitPublicEnquiry(
  request: Request,
  collection: Extract<SubmissionCollectionName, "contact" | "enquiries">,
) {
  try {
    const limited = await enforceRateLimit(
      request,
      `${collection}-create`,
      5,
      15 * 60 * 1000,
    );
    if (limited) {
      return limited;
    }

    const parsed = await parseJson(request, enquirySchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    const enquiry: EnquirySubmission = {
      id: createSubmissionId(),
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      company: parsed.data.company,
      service: parsed.data.service,
      message: parsed.data.message,
      status: "new",
      createdAt: new Date(),
    };
    await createSubmissionRecord(collection, enquiry);

    let emailNotificationSent = false;
    try {
      await sendEnquiryNotification(enquiry, getSmtpEnv());
      emailNotificationSent = true;
    } catch (error) {
      console.error(
        `The ${collection} was saved, but SMTP notification delivery failed`,
        error,
      );
    }

    return apiSuccess(
      {
        message: emailNotificationSent
          ? "Thank you. Your enquiry has been received."
          : "Your enquiry was received, but email notification is delayed. Our team will follow up.",
        enquiryId: enquiry.id,
        emailNotificationSent,
      },
      201,
    );
  } catch (error) {
    console.error(`POST /api/${collection} failed`, error);
    return apiError("Unable to submit your enquiry right now.", 503);
  }
}
