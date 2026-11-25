import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import {
  escapeSearchRegex,
  parseAdminListQuery,
} from "@/lib/admin-query";
import { parseJson } from "@/lib/parse-json";
import { serviceInputSchema } from "@/utils/admin-schemas";
import { serializeService } from "@/lib/api-serializers";
import { createLocalId } from "@/lib/local-json-store";
import {
  createServiceRecord,
  readServiceRecords,
} from "@/lib/data-store";
import { DuplicateRecordError } from "@/lib/duplicate-record";

export async function GET(request: Request) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }
  const query = parseAdminListQuery(request);
  if (query instanceof Response) {
    return query;
  }

  const active = new URL(request.url).searchParams.get("active") ?? "all";
  if (!["all", "true", "false"].includes(active)) {
    return apiError("Invalid active filter.", 400);
  }

  try {
    const search = query.search
      ? new RegExp(escapeSearchRegex(query.search), "i")
      : null;
    const matching = (await readServiceRecords())
      .filter(
        (item) =>
          (active === "all" || item.isActive === (active === "true")) &&
          (!search || search.test(item.title) || search.test(item.description)),
      )
      .sort(
        (left, right) =>
          right.createdAt.getTime() - left.createdAt.getTime() ||
          right._id.localeCompare(left._id),
      );
    const offset = (query.page - 1) * query.limit;
    const items = matching.slice(offset, offset + query.limit);
    return apiSuccess({
      items: items.map(serializeService),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: matching.length,
        totalPages: Math.max(1, Math.ceil(matching.length / query.limit)),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/services failed", error);
    return apiError("Unable to load services right now.", 503);
  }
}

export async function POST(request: Request) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }
  const parsed = await parseJson(request, serviceInputSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const item = await createServiceRecord({
      _id: createLocalId(),
      ...parsed.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return apiSuccess({ item: serializeService(item) }, 201);
  } catch (error) {
    if (error instanceof DuplicateRecordError) {
      return apiError("A service with that slug already exists.", 409);
    }
    console.error("POST /api/admin/services failed", error);
    return apiError("Unable to create the service right now.", 503);
  }
}
