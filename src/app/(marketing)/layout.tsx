import { createMarketingMetadata } from "@/lib/marketing-metadata";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export const metadata = createMarketingMetadata({
  title: "eCore Business | B2B Data & Lead Generation",
  description:
    "Verified business information, marketing databases, and lead generation solutions for growing businesses.",
  path: "/",
  absoluteTitle: true,
});

export default function MarketingLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
