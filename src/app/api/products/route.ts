import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { parseJson } from "@/lib/parse-json";
import {
  assertSampleExists,
} from "@/lib/object-storage";
import { productInputSchema } from "@/utils/product-schema";
import { serializePublicProduct } from "@/lib/api-serializers";
import {
  createProductRecord,
  readProductRecords,
} from "@/lib/data-store";
import { createLocalId } from "@/lib/local-json-store";
import { DuplicateRecordError } from "@/lib/duplicate-record";

export async function GET(request: Request) {
  try {
    const limited = await enforceRateLimit(
      request,
      "product-list",
      120,
      60 * 1000,
    );
    if (limited) {
      return limited;
    }

    const records = await readProductRecords();
    const products = records
      .filter((product) => product.isActive)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    return apiSuccess({
      items: await Promise.all(products.map(serializePublicProduct)),
    });
  } catch (error) {
    console.error("GET /api/products failed", error);
    return apiError("Unable to load products right now.", 503);
  }
}

export async function POST(request: Request) {
  const unauthorized = await authorizeAdmin(request, ["superadmin", "admin"]);
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = await parseJson(request, productInputSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    if (parsed.data.image.startsWith("products/images/")) {
      await assertSampleExists(parsed.data.image);
    }
    if (parsed.data.sampleFile) {
      await assertSampleExists(parsed.data.sampleFile);
    }

    const product = await createProductRecord({
      _id: createLocalId(),
      ...parsed.data,
      sampleFile: parsed.data.sampleFile ?? null,
      createdAt: new Date(),
    });
    return apiSuccess({ item: await serializePublicProduct(product) }, 201);
  } catch (error) {
    if (error instanceof DuplicateRecordError) {
      return apiError("A product with that name already exists.", 409);
    }

    console.error("POST /api/products failed", error);
    return apiError("Unable to create this product right now.", 503);
  }
}
