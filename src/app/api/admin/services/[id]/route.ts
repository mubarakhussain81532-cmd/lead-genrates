import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { parseJson } from "@/lib/parse-json";
import { serviceUpdateSchema } from "@/utils/admin-schemas";
import { serializeService } from "@/lib/api-serializers";
import {
  DuplicateLocalRecordError,
  isLocalId,
  updateLocalStore,
} from "@/lib/local-json-store";

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
    const item = await updateLocalStore((store) => {
      const service = store.services.find((record) => record._id === id);
      if (!service) {
        return null;
      }
      if (
        parsed.data.slug &&
        store.services.some(
          (record) => record._id !== id && record.slug === parsed.data.slug,
        )
      ) {
        throw new DuplicateLocalRecordError("Duplicate service slug.");
      }
      Object.assign(service, parsed.data, { updatedAt: new Date() });
      return service;
    });
    if (!item) {
      return apiError("Service not found.", 404);
    }
    return apiSuccess({ item: serializeService(item) });
  } catch (error) {
    if (error instanceof DuplicateLocalRecordError) {
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
    const item = await updateLocalStore((store) => {
      const service = store.services.find((record) => record._id === id);
      if (service) {
        service.isActive = false;
        service.updatedAt = new Date();
      }
      return service ?? null;
    });
    if (!item) {
      return apiError("Service not found.", 404);
    }
    return apiSuccess({ message: "Service deactivated." });
  } catch (error) {
    console.error("DELETE /api/admin/services/[id] failed", error);
    return apiError("Unable to deactivate this service right now.", 503);
  }
}
