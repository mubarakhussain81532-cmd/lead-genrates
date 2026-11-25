import { apiError, apiSuccess } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { parseJson } from "@/lib/parse-json";
import {
  createSubmissionId,
  updateSubmissionRecords,
} from "@/lib/submission-json-store";
import { newsletterSchema } from "@/utils/newsletter-schema";

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(
      request,
      "newsletter-subscribe",
      5,
      60 * 60 * 1000,
    );
    if (limited) {
      return limited;
    }

    const parsed = await parseJson(request, newsletterSchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    const email = parsed.data.email.toLowerCase();
    await updateSubmissionRecords("newsletter", (records) => {
      if (!records.some((record) => record.email.toLowerCase() === email)) {
        records.push({
          id: createSubmissionId(),
          email,
          createdAt: new Date(),
        });
      }
    });

    return apiSuccess(
      { message: "Thanks for subscribing to our newsletter." },
      201,
    );
  } catch (error) {
    console.error("POST /api/newsletter failed", error);
    return apiError("Unable to subscribe right now. Please try again.", 503);
  }
}
