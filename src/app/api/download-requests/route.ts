import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { createDownloadToken } from "@/lib/download-token";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { assertSampleExists } from "@/lib/object-storage";
import { parseJson } from "@/lib/parse-json";
import { downloadRequestSchema } from "@/utils/product-schema";
import {
  escapeSearchRegex,
  parseAdminListQuery,
} from "@/lib/admin-query";
import { readLocalStore } from "@/lib/local-json-store";
import {
  createSubmissionId,
  readSubmissionRecords,
  updateSubmissionRecords,
} from "@/lib/submission-json-store";
import type { DownloadRequestSubmission } from "@/types/submissions";

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(
      request,
      "sample-request",
      5,
      15 * 60 * 1000,
    );
    if (limited) {
      return limited;
    }

    const parsed = await parseJson(request, downloadRequestSchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    const input = parsed.data;
    const product = (await readLocalStore()).products.find(
      (item) => item._id === input.productId && item.isActive,
    );
    if (!product) {
      return apiError("The selected product is not currently available.", 404);
    }

    const downloadRequest: DownloadRequestSubmission = {
      id: createSubmissionId(),
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      company: input.company,
      productId: product._id,
      createdAt: new Date(),
    };
    await updateSubmissionRecords("download-requests", (records) => {
      records.push(downloadRequest);
    });

    let downloadUrl: string | null = null;
    let message =
      "Your request has been received. The sample is not available right now; our team will follow up.";

    if (product.sampleFile) {
      try {
        await assertSampleExists(product.sampleFile);
        const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;
        const token = createDownloadToken(
          downloadRequest.id,
          product._id,
          expiresAt,
        );
        downloadUrl = `/api/downloads/${token}`;
        message = "Your sample request is ready.";
      } catch (error) {
        console.error(
          "Download request was saved, but a sample link could not be prepared",
          error,
        );
      }
    }

    return apiSuccess(
      {
        message,
        downloadUrl,
        expiresInSeconds: downloadUrl ? 5 * 60 : null,
      },
      201,
    );
  } catch (error) {
    console.error("POST /api/download-requests failed", error);
    return apiError("Unable to prepare this sample request right now.", 503);
  }
}

export async function GET(request: Request) {
  const unauthorized = await authorizeAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  const query = parseAdminListQuery(request);
  if (query instanceof Response) {
    return query;
  }
  try {
    const [downloadRequests, store] = await Promise.all([
      readSubmissionRecords("download-requests"),
      readLocalStore(),
    ]);
    const search = query.search
      ? new RegExp(escapeSearchRegex(query.search), "i")
      : null;
    const matching = downloadRequests
      .filter(
        (record) =>
          !search ||
          [record.name, record.email, record.phone, record.company].some(
            (value) => search.test(value),
          ),
      )
      .sort(
        (left, right) =>
          right.createdAt.getTime() - left.createdAt.getTime() ||
          right.id.localeCompare(left.id),
      );
    const offset = (query.page - 1) * query.limit;
    const records = matching.slice(offset, offset + query.limit);

    return apiSuccess({
      items: records.map((record) => ({
        id: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone,
        company: record.company ?? "",
        productId: record.productId,
        productName:
          store.products.find((product) => product._id === record.productId)
            ?.name ?? "Deleted product",
        createdAt: record.createdAt.toISOString(),
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: matching.length,
        totalPages: Math.max(1, Math.ceil(matching.length / query.limit)),
      },
    });
  } catch (error) {
    console.error("GET /api/download-requests failed", error);
    return apiError("Unable to load download requests right now.", 503);
  }
}
