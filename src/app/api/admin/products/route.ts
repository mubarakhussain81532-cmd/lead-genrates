import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import {
  escapeSearchRegex,
  parseAdminListQuery,
} from "@/lib/admin-query";
import { serializeAdminProduct } from "@/lib/api-serializers";
import { readLocalStore } from "@/lib/local-json-store";

export async function GET(request: Request) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }

  const query = parseAdminListQuery(request);
  if (query instanceof Response) {
    return query;
  }
  const url = new URL(request.url);
  const active = url.searchParams.get("active") ?? "all";
  if (!["all", "true", "false"].includes(active)) {
    return apiError("Invalid active filter.", 400);
  }

  try {
    const search = query.search
      ? new RegExp(escapeSearchRegex(query.search), "i")
      : null;
    const matching = (await readLocalStore()).products
      .filter((product) => {
        if (active !== "all" && product.isActive !== (active === "true")) {
          return false;
        }
        return (
          !search ||
          [product.name, product.category, product.description].some((value) =>
            search.test(value),
          )
        );
      })
      .sort(
        (left, right) =>
          right.createdAt.getTime() - left.createdAt.getTime() ||
          right._id.localeCompare(left._id),
      );
    const offset = (query.page - 1) * query.limit;
    const products = matching.slice(offset, offset + query.limit);

    return apiSuccess({
      items: await Promise.all(products.map(serializeAdminProduct)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: matching.length,
        totalPages: Math.max(1, Math.ceil(matching.length / query.limit)),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/products failed", error);
    return apiError("Unable to load products right now.", 503);
  }
}
