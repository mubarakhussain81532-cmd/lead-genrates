import { z } from "zod";
import { apiError } from "@/lib/api-response";

const MAX_JSON_BYTES = 16 * 1024;

type ParseJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response };

export async function parseJson<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
): Promise<ParseJsonResult<z.output<TSchema>>> {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (mediaType !== "application/json") {
    return {
      ok: false,
      response: apiError("Content-Type must be application/json.", 415),
    };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BYTES) {
    return {
      ok: false,
      response: apiError("Request body is too large.", 413),
    };
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return {
      ok: false,
      response: apiError("A JSON request body is required.", 400),
    };
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let oversized = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      totalBytes += value.byteLength;
      if (totalBytes > MAX_JSON_BYTES) {
        oversized = true;
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
  } catch {
    return {
      ok: false,
      response: apiError("Unable to read the request body.", 400),
    };
  } finally {
    reader.releaseLock();
  }

  if (oversized) {
    return {
      ok: false,
      response: apiError("Request body is too large.", 413),
    };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {
      ok: false,
      response: apiError("Request body must contain valid JSON.", 400),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Request validation failed.",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      ),
    };
  }

  return { ok: true, data: parsed.data };
}
