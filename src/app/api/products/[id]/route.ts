import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { parseJson } from "@/lib/parse-json";
import {
  assertSampleExists,
} from "@/lib/object-storage";
import { productUpdateSchema } from "@/utils/product-schema";
import { serializePublicProduct } from "@/lib/api-serializers";
import {
  DuplicateLocalRecordError,
  isLocalId,
  readLocalStore,
  updateLocalStore,
} from "@/lib/local-json-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function validateIdAndAuthorization(request: Request, id: string) {
  const unauthorized = await authorizeAdmin(
    request,
    ["superadmin", "admin"],
  );
  if (unauthorized) {
    return unauthorized;
  }
  if (!isLocalId(id)) {
    return apiError("Invalid product ID.", 400);
  }
  return null;
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isLocalId(id)) {
    return apiError("Invalid product ID.", 400);
  }

  try {
    const limited = await enforceRateLimit(
      request,
      "product-detail",
      120,
      60 * 1000,
    );
    if (limited) {
      return limited;
    }

    const store = await readLocalStore();
    const product = store.products.find(
      (item) => item._id === id && item.isActive,
    );
    if (!product) {
      return apiError("Product not found.", 404);
    }

    return apiSuccess({ item: await serializePublicProduct(product) });
  } catch (error) {
    console.error("GET /api/products/[id] failed", error);
    return apiError("Unable to load this product right now.", 503);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const invalid = await validateIdAndAuthorization(request, id);
  if (invalid) {
    return invalid;
  }

  const parsed = await parseJson(request, productUpdateSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    if (parsed.data.image?.startsWith("products/images/")) {
      await assertSampleExists(parsed.data.image);
    }
    if (parsed.data.sampleFile) {
      await assertSampleExists(parsed.data.sampleFile);
    }

    const product = await updateLocalStore((store) => {
      const item = store.products.find((record) => record._id === id);
      if (!item) {
        return null;
      }
      if (
        parsed.data.name &&
        store.products.some(
          (record) => record._id !== id && record.name === parsed.data.name,
        )
      ) {
        throw new DuplicateLocalRecordError("Duplicate product name.");
      }
      Object.assign(item, parsed.data);
      return item;
    });
    if (!product) {
      return apiError("Product not found.", 404);
    }

    return apiSuccess({ item: await serializePublicProduct(product) });
  } catch (error) {
    if (error instanceof DuplicateLocalRecordError) {
      return apiError("A product with that name already exists.", 409);
    }

    console.error("PATCH /api/products/[id] failed", error);
    return apiError("Unable to update this product right now.", 503);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const invalid = await validateIdAndAuthorization(request, id);
  if (invalid) {
    return invalid;
  }

  try {
    const product = await updateLocalStore((store) => {
      const item = store.products.find((record) => record._id === id);
      if (item) {
        item.isActive = false;
      }
      return item ?? null;
    });
    if (!product) {
      return apiError("Product not found.", 404);
    }

    return apiSuccess({ message: "Product deactivated." });
  } catch (error) {
    console.error("DELETE /api/products/[id] failed", error);
    return apiError("Unable to deactivate this product right now.", 503);
  }
}
