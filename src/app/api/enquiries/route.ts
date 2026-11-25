import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { serializeSubmissionEnquiry } from "@/lib/api-serializers";
import {
  enquiryStatuses,
} from "@/utils/enquiry-schema";
import { submitPublicEnquiry } from "@/lib/submit-public-enquiry";
import {
  escapeSearchRegex,
  parseAdminListQuery,
} from "@/lib/admin-query";
import {
  readSubmissionRecords,
} from "@/lib/submission-json-store";

export async function POST(request: Request) {
  return submitPublicEnquiry(request, "enquiries");
}

export async function GET(request: Request) {
  const unauthorized = await authorizeAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  const query = parseAdminListQuery(request);
  if (query instanceof Response) {
    return query;
  }
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  if (status && !enquiryStatuses.includes(status as (typeof enquiryStatuses)[number])) {
    return apiError("Invalid enquiry status.", 400);
  }

  try {
    const [enquiries, contacts] = await Promise.all([
      readSubmissionRecords("enquiries"),
      readSubmissionRecords("contact"),
    ]);
    const search = query.search
      ? new RegExp(escapeSearchRegex(query.search), "i")
      : null;
    const matching = [...enquiries, ...contacts]
      .filter((enquiry) => {
        if (status && enquiry.status !== status) {
          return false;
        }
        return (
          !search ||
          [
            enquiry.name,
            enquiry.email,
            enquiry.phone,
            enquiry.company,
            enquiry.service,
          ].some((value) => search.test(value))
        );
      })
      .sort(
        (left, right) =>
          right.createdAt.getTime() - left.createdAt.getTime() ||
          right.id.localeCompare(left.id),
      );
    const offset = (query.page - 1) * query.limit;

    return apiSuccess({
      items: matching
        .slice(offset, offset + query.limit)
      .map(serializeSubmissionEnquiry),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: matching.length,
        totalPages: Math.max(1, Math.ceil(matching.length / query.limit)),
      },
    });
  } catch (error) {
    console.error("GET /api/enquiries failed", error);
    return apiError("Unable to load enquiries right now.", 503);
  }
}
