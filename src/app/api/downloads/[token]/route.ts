import { apiError } from "@/lib/api-response";
import { verifyDownloadToken } from "@/lib/download-token";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { createSampleDownloadUrl } from "@/lib/object-storage";
import { findProductById, readSubmissionRecords } from "@/lib/data-store";

type RouteContext = {
  params: Promise<{ token: string }>;
};

function getFilenameFromKey(key: string): string {
  const filename = key.slice(key.lastIndexOf("/") + 1);
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(filename)
    ? filename
    : "business-database-sample";
}

export async function GET(request: Request, { params }: RouteContext) {
  const { token } = await params;
  try {
    const limited = await enforceRateLimit(
      request,
      "sample-download",
      20,
      15 * 60 * 1000,
    );
    if (limited) {
      return limited;
    }

    let tokenPayload;
    try {
      tokenPayload = verifyDownloadToken(token);
    } catch (error) {
      console.error("Download token configuration failed", error);
      return apiError("Sample downloads are not configured.", 503);
    }
    if (!tokenPayload) {
      return apiError("This download link is invalid or has expired.", 401);
    }

    const [downloadRequests, product] = await Promise.all([
      readSubmissionRecords("download-requests"),
      findProductById(tokenPayload.productId),
    ]);
    const downloadRequest = downloadRequests.find(
      (item) => item.id === tokenPayload.requestId,
    );
    if (
      !downloadRequest ||
      downloadRequest.productId !== tokenPayload.productId
    ) {
      return apiError("This download link is invalid or has expired.", 401);
    }

    if (!product?.isActive || !product.sampleFile) {
      return apiError("The sample file is no longer available.", 404);
    }

    const signedUrl = await createSampleDownloadUrl(
      product.sampleFile,
      getFilenameFromKey(product.sampleFile),
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    console.error("GET /api/downloads/[token] failed", error);
    return apiError("Unable to prepare this download right now.", 503);
  }
}
