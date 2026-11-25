import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import {
  deletePrivateObject,
  inspectPrivateObject,
  isMissingStorageObject,
} from "@/lib/object-storage";
import {
  getUploadFileDetails,
  isUploadKeyValid,
  matchesFileSignature,
} from "@/lib/upload-files";
import { parseJson } from "@/lib/parse-json";
import { uploadCompletionSchema } from "@/utils/admin-schemas";

export async function POST(request: Request) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }
  const limited = await enforceRateLimit(
    request,
    "admin-file-upload-complete",
    30,
    60 * 60 * 1000,
  );
  if (limited) {
    return limited;
  }

  const parsed = await parseJson(request, uploadCompletionSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  const { kind, key, contentType, size } = parsed.data;
  const details = getUploadFileDetails(kind, contentType);
  if (!details) {
    return apiError("The uploaded file type is not allowed.", 400);
  }
  if (size > details.maxBytes) {
    return apiError("The uploaded file exceeds the size limit.", 413);
  }
  if (!isUploadKeyValid(kind, key, details.extension)) {
    return apiError("The upload key is invalid.", 400);
  }

  try {
    const object = await inspectPrivateObject(key);
    if (
      object.contentLength !== size ||
      object.contentType !== contentType ||
      !matchesFileSignature(kind, contentType, object.signature)
    ) {
      await deletePrivateObject(key);
      return apiError("The uploaded file did not pass verification.", 400);
    }

    return apiSuccess({ key, kind }, 201);
  } catch (error) {
    if (isMissingStorageObject(error)) {
      return apiError("The uploaded file was not found in private storage.", 400);
    }
    console.error("POST /api/admin/uploads/complete failed", error);
    return apiError("Unable to verify this upload right now.", 503);
  }
}
