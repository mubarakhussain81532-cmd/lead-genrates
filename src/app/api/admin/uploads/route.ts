import { randomUUID } from "node:crypto";
import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { createPrivateUploadUrl } from "@/lib/object-storage";
import {
  createUploadKey,
  getUploadFileDetails,
  type UploadKind,
} from "@/lib/upload-files";
import { uploadTicketSchema } from "@/utils/admin-schemas";
import { parseJson } from "@/lib/parse-json";

export async function POST(request: Request) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }
  const limited = await enforceRateLimit(
    request,
    "admin-file-upload",
    30,
    60 * 60 * 1000,
  );
  if (limited) {
    return limited;
  }

  const kindValue = new URL(request.url).searchParams.get("kind");
  if (kindValue !== "image" && kindValue !== "sample") {
    return apiError("Upload kind must be image or sample.", 400);
  }
  const kind: UploadKind = kindValue;
  const parsed = await parseJson(request, uploadTicketSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  const details = getUploadFileDetails(kind, parsed.data.contentType);
  if (!details) {
    return apiError(
      kind === "image"
        ? "Use a JPEG, PNG, or WebP image."
        : "Use a PDF, XLS, or XLSX file.",
      400,
    );
  }
  if (parsed.data.size > details.maxBytes) {
    return apiError("The uploaded file exceeds the size limit.", 413);
  }

  const key = createUploadKey(kind, randomUUID(), details.extension);
  try {
    const upload = await createPrivateUploadUrl(key, parsed.data.contentType);
    return apiSuccess(
      { key, kind, ...upload, expiresInSeconds: 300 },
      201,
    );
  } catch (error) {
    console.error("POST /api/admin/uploads failed to create upload URL", error);
    return apiError("Unable to prepare this upload right now.", 503);
  }
}
