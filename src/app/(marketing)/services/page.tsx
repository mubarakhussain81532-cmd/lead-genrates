import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import PageHero from "@/components/page-hero";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import ServiceCard from "@/components/service-card";
import { createMarketingMetadata } from "@/lib/marketing-metadata";
import { getPublicServices } from "@/lib/public-content";

export const metadata = createMarketingMetadata({
  title: "Services",
  description:
    "Explore B2B databases, lead generation, data conversion, data enhancement, and sales support services from eCore Business.",
  path: "/services",
});

async function ServicesList() {
  const services = await getPublicServices();
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <Reveal key={service.slug} delay={index * 0.04}>
          <div id={service.slug} className="h-full scroll-mt-28">
            <ServiceCard service={service} />
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our services"
        title="Focused support for every step toward growth."
        description="Choose the information, research, or operational support that fits your next business priority."
        actionLabel="Discuss a requirement"
        actionHref="/contact#inquiry"
      />

      <section id="services" className="scroll-mt-24 bg-[#f7faf9] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="What we do"
              title="Services built around practical outcomes."
              description="Start with a single requirement or combine services into a workflow that makes sense for your team."
            />
          </Reveal>
          <Suspense
            fallback={
              <div className="mt-10 min-h-72 animate-pulse rounded-2xl bg-slate-100" />
            }
          >
            <ServicesList />
          </Suspense>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087f75]">
              A considered approach
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
              The work is shaped to your brief—not the other way around.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              We align on audience, geography, data fields, and delivery needs
              before confirming the scope. That way, each part of the project
              stays connected to the result your team is working toward.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#087f75]"
            >
              Plan a project <ArrowRight size={15} />
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-3xl bg-[#0a1d2b] p-7 text-white sm:p-10">
              <SectionHeading
                eyebrow="What to expect"
                title="A clear brief. A clear next step."
                light
              />
              <ul className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  "Audience and use-case alignment",
                  "Agreed fields and project scope",
                  "Practical review checkpoints",
                  "A delivery format your team can use",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-200"
                  >
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#80ddc1]/15 text-[#8ce2ce]">
                      <Check size={12} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
