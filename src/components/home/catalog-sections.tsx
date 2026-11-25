import { getPublicServices } from "@/lib/public-content";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DatabaseCard from "@/components/database-card";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import ServiceCard from "@/components/service-card";
import { databaseProducts } from "@/lib/marketing-content";

export async function ServicesSection() {
  const services = await getPublicServices();

  return (
    <section id="services" className="scroll-mt-24 bg-[#f7faf9] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Services for momentum"
            title="Practical support for your entire sales journey."
            description="Choose a focused service or bring together the support that fits your goals."
          />
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 pb-1 text-sm font-semibold text-[#087f75]"
          >
            View all services <ArrowRight size={16} />
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.035}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DatabasesSection() {
  return (
    <section id="databases" className="scroll-mt-24 bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Explore our databases"
            title="Find the business audience you want to reach."
            description="Browse focused business information collections, then shape the scope around your market and campaign."
          />
          <Link
            href="/databases"
            className="inline-flex shrink-0 items-center gap-2 pb-1 text-sm font-semibold text-[#087f75]"
          >
            Browse collections <ArrowRight size={16} />
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {databaseProducts.slice(0, 6).map((product, index) => (
            <Reveal key={product.title} delay={index * 0.04}>
              <DatabaseCard product={product} index={index} />
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Each collection is scoped to your requirements and intended use.
          Availability and fields are confirmed during consultation.
        </p>
      </div>
    </section>
  );
}
