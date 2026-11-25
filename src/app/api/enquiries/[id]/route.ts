import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { parseJson } from "@/lib/parse-json";
import { enquiryStatusSchema } from "@/utils/enquiry-schema";
import { serializeSubmissionEnquiry } from "@/lib/api-serializers";
import { isLocalId } from "@/lib/local-json-store";
import {
  readSubmissionRecords,
  updateSubmissionRecords,
} from "@/lib/submission-json-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function validateAdminAndId(
  request: Request,
  id: string,
  allowedRoles?: readonly ("superadmin" | "admin" | "support")[],
) {
  const unauthorized = await authorizeAdmin(request, allowedRoles);
  if (unauthorized) {
    return unauthorized;
  }
  if (!isLocalId(id)) {
    return apiError("Invalid enquiry ID.", 400);
  }
  return null;
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const invalid = await validateAdminAndId(request, id);
  if (invalid) {
    return invalid;
  }

  try {
    const [enquiries, contacts] = await Promise.all([
      readSubmissionRecords("enquiries"),
      readSubmissionRecords("contact"),
    ]);
    const enquiry = [...enquiries, ...contacts].find(
      (item) => item.id === id,
    );
    if (!enquiry) {
      return apiError("Enquiry not found.", 404);
    }

    return apiSuccess({ item: serializeSubmissionEnquiry(enquiry) });
  } catch (error) {
    console.error("GET /api/enquiries/[id] failed", error);
    return apiError("Unable to load this enquiry right now.", 503);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const invalid = await validateAdminAndId(request, id);
  if (invalid) {
    return invalid;
  }

  const parsed = await parseJson(request, enquiryStatusSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const [enquiries, contacts] = await Promise.all([
      readSubmissionRecords("enquiries"),
      readSubmissionRecords("contact"),
    ]);
    const collection = enquiries.some((item) => item.id === id)
      ? "enquiries"
      : contacts.some((item) => item.id === id)
        ? "contact"
        : null;
    if (!collection) {
      return apiError("Enquiry not found.", 404);
    }

    const enquiry = await updateSubmissionRecords(collection, (records) => {
      const item = records.find((record) => record.id === id);
      if (item) {
        item.status = parsed.data.status;
      }
      return item ?? null;
    });
    if (!enquiry) {
      return apiError("Enquiry not found.", 404);
    }

    return apiSuccess({ item: serializeSubmissionEnquiry(enquiry) });
  } catch (error) {
    console.error("PATCH /api/enquiries/[id] failed", error);
    return apiError("Unable to update this enquiry right now.", 503);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const invalid = await validateAdminAndId(request, id, ["superadmin", "admin"]);
  if (invalid) {
    return invalid;
  }

  try {
    const [enquiries, contacts] = await Promise.all([
      readSubmissionRecords("enquiries"),
      readSubmissionRecords("contact"),
    ]);
    const collection = enquiries.some((item) => item.id === id)
      ? "enquiries"
      : contacts.some((item) => item.id === id)
        ? "contact"
        : null;
    if (!collection) {
      return apiError("Enquiry not found.", 404);
    }

    const enquiry = await updateSubmissionRecords(collection, (records) => {
      const index = records.findIndex((item) => item.id === id);
      return index < 0 ? null : records.splice(index, 1)[0];
    });
    if (!enquiry) {
      return apiError("Enquiry not found.", 404);
    }

    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("DELETE /api/enquiries/[id] failed", error);
    return apiError("Unable to delete this enquiry right now.", 503);
  }
}
