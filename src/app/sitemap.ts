import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const routes = ["/", "/about", "/services", "/databases", "/contact"];

  return routes.map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
