import "server-only";

import { apiError } from "@/lib/api-response";
import { getAdminIdentity, getAdminSessionToken } from "@/lib/admin-session";
import type { AdminRole } from "@/types/admin";

export function validateSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return apiError("Invalid request origin.", 403);
  }

  if (!origin || origin !== requestOrigin) {
    return apiError("Request origin is not allowed.", 403);
  }

  return null;
}

export async function authorizeAdmin(
  request: Request,
  allowedRoles: readonly AdminRole[] = ["superadmin", "admin", "support"],
): Promise<Response | null> {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const invalidOrigin = validateSameOrigin(request);
    if (invalidOrigin) {
      return invalidOrigin;
    }
  }

  const sessionToken = getAdminSessionToken(request);
  try {
    const admin = await getAdminIdentity(sessionToken);
    if (!admin) {
      return apiError("Authentication is required.", 401);
    }
    if (!allowedRoles.includes(admin.role)) {
      return apiError("You do not have permission to perform this action.", 403);
    }
  } catch (error) {
    console.error("Admin session validation failed", error);
    return apiError("Unable to validate your admin session right now.", 503);
  }

  return null;
}
