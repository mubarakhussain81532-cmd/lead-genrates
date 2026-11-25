import "server-only";

import { apiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";

export async function enforceRateLimit(
  request: Request,
  scope: string,
  maxHits: number,
  windowMs: number,
): Promise<Response | null> {
  const result = await checkRateLimit(request, scope, maxHits, windowMs);
  if (result.allowed) {
    return null;
  }

  return apiError("Too many requests. Please try again later.", 429, {
    "Retry-After": String(result.retryAfterSeconds),
  });
}
