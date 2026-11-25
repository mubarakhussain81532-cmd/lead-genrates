import { apiError, apiSuccess } from "@/lib/api-response";
import { validateSameOrigin } from "@/lib/admin-auth";
import {
  adminSessionCookieName,
  getAdminSessionToken,
  revokeAdminSession,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  const invalidOrigin = validateSameOrigin(request);
  if (invalidOrigin) {
    return invalidOrigin;
  }

  try {
    const token = getAdminSessionToken(request);
    if (token) {
      await revokeAdminSession(token);
    }
  } catch (error) {
    console.error("POST /api/admin/logout failed to revoke session", error);
    return apiError("Unable to sign out right now.", 503);
  }

  const response = apiSuccess({ message: "Signed out." });
  response.headers.set(
    "Set-Cookie",
    `${adminSessionCookieName()}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return response;
}
