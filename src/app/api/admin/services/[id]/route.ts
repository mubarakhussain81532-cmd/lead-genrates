import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { parseJson } from "@/lib/parse-json";
import { serviceUpdateSchema } from "@/utils/admin-schemas";
import { serializeService } from "@/lib/api-serializers";
import { isLocalId } from "@/lib/local-json-store";
import {
  deactivateServiceRecord,
  updateServiceRecord,
} from "@/lib/data-store";
import { DuplicateRecordError } from "@/lib/duplicate-record";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }
  const { id } = await params;
  if (!isLocalId(id)) {
    return apiError("Invalid service ID.", 400);
  }
  const parsed = await parseJson(request, serviceUpdateSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const item = await updateServiceRecord(id, parsed.data);
    if (!item) {
      return apiError("Service not found.", 404);
    }
    return apiSuccess({ item: serializeService(item) });
  } catch (error) {
    if (error instanceof DuplicateRecordError) {
      return apiError("A service with that slug already exists.", 409);
    }
    console.error("PATCH /api/admin/services/[id] failed", error);
    return apiError("Unable to update the service right now.", 503);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }
  const { id } = await params;
  if (!isLocalId(id)) {
    return apiError("Invalid service ID.", 400);
  }

  try {
    const item = await deactivateServiceRecord(id);
    if (!item) {
      return apiError("Service not found.", 404);
    }
    return apiSuccess({ message: "Service deactivated." });
  } catch (error) {
    console.error("DELETE /api/admin/services/[id] failed", error);
    return apiError("Unable to deactivate this service right now.", 503);
  }
}
