import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  FileCheck2,
  Handshake,
  ShieldCheck,
} from "lucide-react";
import PageHero from "@/components/page-hero";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import { createMarketingMetadata } from "@/lib/marketing-metadata";

export const metadata = createMarketingMetadata({
  title: "About Us",
  description:
    "Learn how eCore Business helps teams make better-informed decisions with focused business research and data support.",
  path: "/about",
});

const principles = [
  {
    icon: Compass,
    title: "Start with context",
    description:
      "Understand the audience and the business goal before deciding what information to collect.",
  },
  {
    icon: ShieldCheck,
    title: "Treat quality as a process",
    description:
      "Agree practical checks for consistency and completeness at the start of each project.",
  },
  {
    icon: Handshake,
    title: "Work as one team",
    description:
      "Keep communication clear from the first scope conversation through delivery.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About eCore"
        title="Business research with a clear point of view."
        description="We bring research, structured information, and practical sales support together—so teams can focus their effort on the opportunities that matter."
        actionLabel="Explore our services"
        actionHref="/services"
      />

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <Reveal className="relative mx-auto w-full max-w-[560px]">
            <Image
              src="/images/research-partnership.svg"
              alt="A research team collaborating around business information"
              width={780}
              height={620}
              className="w-full rounded-[1.75rem]"
            />
            <div className="absolute -bottom-4 left-4 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-lg sm:left-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#087f75]">
                Our focus
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Clarity at every step
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <SectionHeading
              eyebrow="The way we work"
              title="Useful information begins with listening."
              description="Every organization has a different market, a different customer, and a different reason to reach out. Our work starts by understanding those differences."
            />
            <p className="mt-5 text-sm leading-7 text-slate-600">
              From business databases and lead research to data conversion and
              back-office support, we help bring structure to the work behind
              stronger customer relationships. Scope, fields, and delivery
              expectations are aligned before a project begins.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {["Business-first research", "Clear project scope", "Practical delivery"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full bg-[#eef7f4] px-3.5 py-2 text-[11px] font-semibold text-[#126b61]"
                  >
                    <FileCheck2 size={14} />
                    {item}
                  </span>
                ),
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#f3f7f5] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Our principles"
              title="Reliable partnerships are built on clear work."
              description="A few simple principles guide how we scope research and support the teams we work with."
              align="center"
            />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} delay={index * 0.06}>
                <article className="h-full rounded-2xl border border-white bg-white p-6 shadow-[0_12px_36px_-30px_rgba(10,29,43,0.35)] sm:p-8">
                  <span className="grid size-12 place-items-center rounded-xl bg-[#e8f5f1] text-[#087f75]">
                    <Icon size={22} />
                  </span>
                  <h2 className="mt-6 text-lg font-semibold text-slate-950">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087f75]">
              Start with a conversation
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Tell us what your team is trying to solve.
            </h2>
          </div>
          <Link
            href="/contact#inquiry"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#087f75] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#05645d]"
          >
            Get in touch <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
