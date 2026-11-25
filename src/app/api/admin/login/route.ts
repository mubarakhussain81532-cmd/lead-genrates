import { apiError, apiSuccess } from "@/lib/api-response";
import { validateSameOrigin } from "@/lib/admin-auth";
import {
  adminSessionMaxAge,
  createAdminSession,
  sessionCookieHeader,
} from "@/lib/admin-session";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { parseJson } from "@/lib/parse-json";
import { verifyPasswordOrDummy } from "@/lib/password";
import { adminLoginSchema } from "@/utils/admin-schemas";
import { findAdminByEmail } from "@/lib/data-store";

export async function POST(request: Request) {
  const invalidOrigin = validateSameOrigin(request);
  if (invalidOrigin) {
    return invalidOrigin;
  }

  try {
    const limited = await enforceRateLimit(
      request,
      "admin-login",
      5,
      15 * 60 * 1000,
    );
    if (limited) {
      return limited;
    }

    const parsed = await parseJson(request, adminLoginSchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    const foundAdmin = await findAdminByEmail(parsed.data.email.toLowerCase());
    const admin = foundAdmin?.isActive ? foundAdmin : null;
    const validPassword = await verifyPasswordOrDummy(
      parsed.data.password,
      admin?.passwordHash,
    );
    if (!admin || !validPassword) {
      return apiError("Email or password is incorrect.", 401);
    }

    const session = await createAdminSession(admin._id);
    const response = apiSuccess({ admin: session.identity });
    response.headers.set(
      "Set-Cookie",
      sessionCookieHeader(session.token, adminSessionMaxAge),
    );
    return response;
  } catch (error) {
    console.error("POST /api/admin/login failed", error);
    return apiError("Unable to sign in right now.", 503);
  }
}
