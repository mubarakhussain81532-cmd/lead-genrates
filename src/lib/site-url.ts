import "server-only";

export function getSiteUrl(): URL {
  const configuredUrl = process.env.SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (!configuredUrl) {
    if (
      process.env.VERCEL_ENV === "production" ||
      (process.env.NODE_ENV === "production" && !vercelUrl)
    ) {
      throw new Error("SITE_URL must be configured for production.");
    }

    return new URL(vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("SITE_URL must be a valid absolute URL.");
  }

  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error("SITE_URL must contain only the site origin.");
  }

  if (
    (process.env.NODE_ENV === "production" ||
      process.env.VERCEL_ENV === "production") &&
    url.protocol !== "https:"
  ) {
    throw new Error("SITE_URL must use HTTPS in production.");
  }

  return new URL(url.origin);
}
