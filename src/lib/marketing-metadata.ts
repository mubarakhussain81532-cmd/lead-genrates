import type { Metadata } from "next";

type MarketingMetadataInput = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
};

export function createMarketingMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: MarketingMetadataInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "eCore Business",
      locale: "en_US",
      type: "website",
      images: [{ url: "/opengraph-image", alt: "eCore Business" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
  };
}
