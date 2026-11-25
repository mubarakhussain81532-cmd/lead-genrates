import Link from "next/link";
import { ArrowRight, FileSpreadsheet, ShieldCheck } from "lucide-react";
import ProductCatalog from "@/components/product-catalog";
import PageHero from "@/components/page-hero";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import { createMarketingMetadata } from "@/lib/marketing-metadata";

export const metadata = createMarketingMetadata({
  title: "Databases",
  description:
    "Browse business database collections for leadership, MSMEs, education, healthcare, hospitality, and manufacturing.",
  path: "/databases",
});

export default function DatabasesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Business databases"
        title="Start with the audience. Build the right list."
        description="Explore focused company and institution collections, then tailor the fields and scope to your business goals."
        actionLabel="Request database details"
        actionHref="/contact#inquiry"
      />

      <section className="bg-[#f7faf9] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Featured collections"
              title="Business information for the markets you serve."
              description="Collections are conversation starters—not one-size-fits-all lists. Share your audience and use case to confirm availability and scope."
            />
          </Reveal>
          <ProductCatalog />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-2 lg:px-10">
          <Reveal>
            <article className="h-full rounded-2xl border border-slate-200 p-6 sm:p-8">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e8f5f1] text-[#087f75]">
                <FileSpreadsheet size={21} />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-slate-950">
                Prepared for your workflow
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fields and formats are agreed in advance, with spreadsheet
                delivery available for review and practical CRM workflows.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.06}>
            <article className="h-full rounded-2xl border border-slate-200 p-6 sm:p-8">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e8f5f1] text-[#087f75]">
                <ShieldCheck size={21} />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-slate-950">
                Scoped with care
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                We confirm the permitted use, source approach, requested
                attributes, and review criteria with you before research begins.
              </p>
            </article>
          </Reveal>
        </div>
        <div className="mx-auto mt-10 max-w-7xl px-5 text-center sm:px-8 lg:px-10">
          <Link
            href="/contact#inquiry"
            className="inline-flex items-center gap-2 rounded-full bg-[#087f75] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#05645d]"
          >
            Talk to us about your audience <ArrowRight size={15} />
          </Link>
          <p className="mx-auto mt-4 max-w-2xl text-[11px] leading-5 text-slate-500">
            Collection availability, fields, and verification scope are
            confirmed during consultation. Audience research is handled with
            applicable privacy requirements in mind.
          </p>
        </div>
      </section>
    </main>
  );
}
