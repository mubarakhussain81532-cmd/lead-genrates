import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: "eCore Business",
  title: {
    default: "eCore Business | B2B Data & Lead Generation",
    template: "%s | eCore Business",
  },
  description:
    "Verified business information, marketing databases, and lead generation solutions for growing businesses.",
  openGraph: {
    title: "eCore Business | B2B Data & Lead Generation",
    description:
      "Verified business information, marketing databases, and lead generation solutions for growing businesses.",
    siteName: "eCore Business",
    locale: "en_US",
    type: "website",
    images: [{ url: "/opengraph-image", alt: "eCore Business" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "eCore Business | B2B Data & Lead Generation",
    description:
      "Verified business information, marketing databases, and lead generation solutions for growing businesses.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
