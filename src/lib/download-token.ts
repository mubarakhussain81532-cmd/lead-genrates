import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getDownloadTokenSecret } from "@/lib/env";

const tokenPayloadSchema = z.object({
  requestId: z.string().regex(/^[a-f\d]{24}$/i),
  productId: z.string().regex(/^[a-f\d]{24}$/i),
  expiresAt: z.number().int(),
});

export type DownloadTokenPayload = z.infer<typeof tokenPayloadSchema>;

export function createDownloadToken(
  requestId: string,
  productId: string,
  expiresAt: number,
): string {
  const payload = tokenPayloadSchema.parse({ requestId, productId, expiresAt });
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = createHmac("sha256", getDownloadTokenSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyDownloadToken(
  token: string,
): DownloadTokenPayload | null {
  const [encodedPayload, providedSignature, extra] = token.split(".");
  if (!encodedPayload || !providedSignature || extra) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getDownloadTokenSecret())
    .update(encodedPayload)
    .digest();
  const receivedSignature = Buffer.from(providedSignature, "base64url");
  if (
    receivedSignature.byteLength !== expectedSignature.byteLength ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return null;
  }

  let body: unknown;
  try {
    body = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    return null;
  }

  const parsed = tokenPayloadSchema.safeParse(body);
  if (!parsed.success || parsed.data.expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return parsed.data;
}
