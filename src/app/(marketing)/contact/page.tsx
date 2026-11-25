import { Suspense } from "react";
import { MapPin } from "lucide-react";
import ContactInquiryForm from "@/components/contact-inquiry-form";
import {
  ContactEmailCta,
  ContactWays,
  OfficeCards,
} from "@/components/contact-information";
import PageHero from "@/components/page-hero";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import { createMarketingMetadata } from "@/lib/marketing-metadata";

export const metadata = createMarketingMetadata({
  title: "Contact Us",
  description:
    "Contact eCore Business to discuss a business database, research, or lead generation requirement.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk about the market you want to reach."
        description="Tell us what your team is working toward. We’ll help you explore the right research, data, or sales support."
      />

      <section id="inquiry" className="scroll-mt-24 bg-[#f7faf9] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Start a conversation"
              title="A good project starts with a clear brief."
              description="Share your target audience, locations, and intended use. The team can help you understand the available options and next steps."
            />
            <Suspense
              fallback={
                <div className="mt-8 h-28 animate-pulse rounded-2xl bg-slate-100" />
              }
            >
              <ContactWays />
            </Suspense>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              When you write, including the industry, location, and types of
              organizations you want to reach will help the team respond with
              relevant next steps.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <ContactInquiryForm />
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e8f5f1] text-[#087f75]">
              <MapPin size={19} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#087f75]">
                Find our offices
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Here when you need us.
              </h2>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="grid min-h-32 animate-pulse gap-4 rounded-2xl bg-slate-100 md:grid-cols-3" />
            }
          >
            <OfficeCards />
          </Suspense>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 rounded-2xl bg-[#eef7f4] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#087f75]">
                Ready when you are
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                A focused brief is all it takes to begin.
              </p>
            </div>
            <Suspense
              fallback={
                <div className="h-12 w-48 animate-pulse rounded-full bg-slate-200" />
              }
            >
              <ContactEmailCta />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
