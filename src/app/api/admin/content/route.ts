import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { defaultSiteContent } from "@/lib/default-site-content";
import { parseJson } from "@/lib/parse-json";
import { siteContentSchema } from "@/utils/admin-schemas";
import { readLocalStore, updateLocalStore } from "@/lib/local-json-store";

export async function GET(request: Request) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const item = (await readLocalStore()).siteContent;
    return apiSuccess({ item: item ?? defaultSiteContent });
  } catch (error) {
    console.error("GET /api/admin/content failed", error);
    return apiError("Unable to load site content right now.", 503);
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }
  const parsed = await parseJson(request, siteContentSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const item = await updateLocalStore((store) => {
      store.siteContent = {
        _id: "public",
        ...parsed.data,
        contact: {
          ...parsed.data.contact,
          email: parsed.data.contact.email.toLowerCase(),
        },
        updatedAt: new Date(),
      };
      return store.siteContent;
    });
    return apiSuccess({ item });
  } catch (error) {
    console.error("PATCH /api/admin/content failed", error);
    return apiError("Unable to save site content right now.", 503);
  }
}
