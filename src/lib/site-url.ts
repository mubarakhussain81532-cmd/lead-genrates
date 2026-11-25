import "server-only";

export function getSiteUrl(): URL {
  const configuredUrl = process.env.SITE_URL?.trim();
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  const resolvedUrl =
    configuredUrl || (vercelHost ? `https://${vercelHost}` : undefined);

  if (!resolvedUrl) {
    if (process.env.VERCEL_ENV === "production") {
      throw new Error(
        "Set SITE_URL or enable Vercel system environment variables for production.",
      );
    }
    return new URL("http://localhost:3000");
  }

  let url: URL;
  try {
    url = new URL(resolvedUrl);
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

  const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (
    (process.env.VERCEL_ENV === "production" ||
      (process.env.NODE_ENV === "production" && !isLocalHost)) &&
    url.protocol !== "https:"
  ) {
    throw new Error("SITE_URL must use HTTPS in production.");
  }

  return new URL(url.origin);
}
