import { apiError } from "@/lib/api-response";

export type AdminListQuery = {
  page: number;
  limit: number;
  search: string;
};

export function parseAdminListQuery(
  request: Request,
): AdminListQuery | Response {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const search = (url.searchParams.get("q") ?? "").trim();
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    page > 10000 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    search.length > 100
  ) {
    return apiError("Invalid page, page size, or search query.", 400);
  }
  return { page, limit, search };
}

export function escapeSearchRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
