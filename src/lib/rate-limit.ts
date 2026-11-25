import "server-only";

import { createHash } from "node:crypto";
import { updateLocalStore } from "@/lib/local-json-store";

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function getClientAddress(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  return forwardedFor?.at(-1) ?? "unknown";
}

export async function checkRateLimit(
  request: Request,
  scope: string,
  maxHits: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const bucketEnd = (bucket + 1) * windowMs;
  const key = createHash("sha256")
    .update(`${scope}:${getClientAddress(request)}:${bucket}`)
    .digest("hex");
  const hits = await updateLocalStore((store) => {
    store.rateLimits = store.rateLimits.filter(
      (entry) => entry.expiresAt.getTime() > now,
    );
    const entry = store.rateLimits.find((item) => item.key === key);
    if (entry) {
      entry.hits += 1;
      return entry.hits;
    }

    store.rateLimits.push({
      key,
      hits: 1,
      expiresAt: new Date(bucketEnd + windowMs),
    });
    return 1;
  });

  return {
    allowed: hits <= maxHits,
    retryAfterSeconds: Math.max(1, Math.ceil((bucketEnd - now) / 1000)),
  };
}
