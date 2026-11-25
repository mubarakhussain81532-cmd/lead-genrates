import { apiError, apiSuccess } from "@/lib/api-response";
import { authorizeAdmin } from "@/lib/admin-auth";
import { readLocalStore } from "@/lib/local-json-store";
import { readSubmissionRecords } from "@/lib/submission-json-store";

export async function GET(request: Request) {
  const unauthorized = await authorizeAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const [store, enquiries, contacts, downloads, newsletter] = await Promise.all([
      readLocalStore(),
      readSubmissionRecords("enquiries"),
      readSubmissionRecords("contact"),
      readSubmissionRecords("download-requests"),
      readSubmissionRecords("newsletter"),
    ]);
    const allEnquiries = [...enquiries, ...contacts];
    const trendStart = new Date();
    trendStart.setUTCHours(0, 0, 0, 0);
    trendStart.setUTCDate(trendStart.getUTCDate() - 6);
    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - (6 - index));
      return {
        date: date.toISOString().slice(0, 10),
        enquiries: 0,
        downloads: 0,
      };
    });
    const trendByDate = new Map(trend.map((item) => [item.date, item]));
    for (const enquiry of allEnquiries) {
      if (enquiry.createdAt >= trendStart && enquiry.status !== "spam") {
        const bucket = trendByDate.get(enquiry.createdAt.toISOString().slice(0, 10));
        if (bucket) {
          bucket.enquiries += 1;
        }
      }
    }
    for (const download of downloads) {
      if (download.createdAt >= trendStart) {
        const bucket = trendByDate.get(download.createdAt.toISOString().slice(0, 10));
        if (bucket) {
          bucket.downloads += 1;
        }
      }
    }

    const latestSubmissions = [
      ...enquiries.map((item) => ({
        id: item.id,
        type: "Enquiry",
        name: item.name,
        email: item.email,
        detail: item.service,
        createdAt: item.createdAt,
      })),
      ...contacts.map((item) => ({
        id: item.id,
        type: "Contact",
        name: item.name,
        email: item.email,
        detail: item.service,
        createdAt: item.createdAt,
      })),
      ...downloads.map((item) => ({
        id: item.id,
        type: "Sample request",
        name: item.name,
        email: item.email,
        detail:
          store.products.find((product) => product._id === item.productId)
            ?.name ?? "Deleted product",
        createdAt: item.createdAt,
      })),
      ...newsletter.map((item) => ({
        id: item.id,
        type: "Newsletter",
        name: item.email,
        email: item.email,
        detail: "Subscription",
        createdAt: item.createdAt,
      })),
    ]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 8)
      .map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }));

    return apiSuccess({
      stats: {
        totalEnquiries: allEnquiries.filter((item) => item.status !== "spam").length,
        newEnquiries: allEnquiries.filter((item) => item.status === "new").length,
        contactedEnquiries: allEnquiries.filter((item) => item.status === "in_progress").length,
        convertedEnquiries: allEnquiries.filter((item) => item.status === "converted").length,
        contactSubmissions: contacts.length,
        totalProducts: store.products.filter((item) => item.isActive).length,
        totalDownloads: downloads.length,
        newsletterSubscriptions: newsletter.length,
      },
      trend,
      latestSubmissions,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard failed", error);
    return apiError("Unable to load dashboard statistics right now.", 503);
  }
}
