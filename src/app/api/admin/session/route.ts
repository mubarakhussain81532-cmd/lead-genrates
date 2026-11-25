import { apiError, apiSuccess } from "@/lib/api-response";
import { getAdminIdentity, getAdminSessionToken } from "@/lib/admin-session";

export async function GET(request: Request) {
  const sessionToken = getAdminSessionToken(request);
  try {
    const admin = await getAdminIdentity(sessionToken);
    if (!admin) {
      return apiError("Authentication is required.", 401);
    }
    return apiSuccess({ admin });
  } catch (error) {
    console.error("GET /api/admin/session failed", error);
    return apiError("Unable to validate your admin session right now.", 503);
  }
}
