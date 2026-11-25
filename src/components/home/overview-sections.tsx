import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  Globe2,
  Handshake,
  SearchCheck,
  Target,
  TimerReset,
} from "lucide-react";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import {
  companyStats,
  industries,
  processSteps,
} from "@/lib/marketing-content";

export function MetricsStrip() {
  return (
    <section className="relative z-10 mx-auto -mt-2 max-w-7xl px-5 pb-8 sm:px-8 lg:px-10">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-40px_rgba(10,29,43,0.45)] md:grid-cols-4">
        {companyStats.map((stat, index) => (
          <div
            key={stat.label}
            className={`px-5 py-6 sm:px-7 sm:py-7 ${
              index % 2 === 0 ? "border-r" : "md:border-r"
            } ${index < 2 ? "border-b md:border-b-0" : ""} border-slate-100 last:border-r-0`}
          >
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[#087f75] sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CompanyIntro() {
  const approach = [
    { icon: SearchCheck, text: "Research shaped to your brief" },
    { icon: FileCheck2, text: "Structured, usable information" },
    { icon: Handshake, text: "Support from scope to delivery" },
  ];

  return (
    <section id="company" className="scroll-mt-24 bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <Reveal className="relative mx-auto w-full max-w-[580px]">
          <div className="absolute -bottom-5 -left-5 size-28 rounded-3xl border border-[#b8ddd2]" />
          <Image
            src="/images/research-partnership.svg"
            alt="Illustration of a research team reviewing business data together"
            width={780}
            height={620}
            className="relative w-full rounded-[1.75rem] shadow-[0_24px_70px_-45px_rgba(10,29,43,0.55)]"
          />
          <div className="absolute -right-2 bottom-7 max-w-[190px] rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:-right-5 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#087f75]">
              Our point of view
            </p>
            <p className="mt-2 text-sm font-semibold leading-5 text-slate-900">
              Useful data begins with a useful question.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <SectionHeading
            eyebrow="A partner in progress"
            title="Good research makes growth feel more intentional."
            description="We help teams make sense of their market with business information that is organized around real sales and marketing priorities."
          />
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
            From defining the audience to preparing a clean, practical file, our
            work is designed to reduce the distance between a business goal and
            the next meaningful conversation.
          </p>
          <ul className="mt-7 space-y-4">
            {approach.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 text-sm font-medium text-slate-700"
              >
                <span className="grid size-8 place-items-center rounded-full bg-[#e8f5f1] text-[#087f75]">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#087f75] hover:text-[#05645d]"
          >
            More about eCore <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  const strengths = [
    {
      icon: Target,
      title: "Specific by design",
      description:
        "Start with your audience, territory, and use case—not a one-size list.",
    },
    {
      icon: BadgeCheck,
      title: "Quality with context",
      description:
        "Agree the fields and review criteria before research moves forward.",
    },
    {
      icon: TimerReset,
      title: "Ready for real workflows",
      description:
        "Receive organized information your team can review and put to work.",
    },
    {
      icon: Globe2,
      title: "A broader view",
      description:
        "Support for India-wide and international research requirements.",
    },
  ];

  return (
    <section className="overflow-hidden bg-[#0a1d2b] py-20 text-white sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="The eCore difference"
            title="The right data is more than a spreadsheet."
            description="It is a clear understanding of your market, thoughtful research, and information prepared for the way your team works."
            light
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {strengths.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition hover:border-[#73d7ba]/40 hover:bg-white/[0.075] sm:p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-[#78ddbf]/10 text-[#83e0c3]">
                  <Icon size={21} />
                </span>
                <h3 className="mt-6 text-base font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="A clear path forward"
            title="From first conversation to useful delivery."
            description="A collaborative process keeps the research focused and the final data practical."
            align="center"
          />
        </Reveal>
        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          <div className="absolute left-[8%] right-[8%] top-6 hidden border-t border-dashed border-[#b8d8cf] lg:block" />
          {processSteps.map(({ number, title, description, icon: Icon }, index) => (
            <Reveal key={number} delay={index * 0.06} className="relative">
              <div className="relative z-10 grid size-12 place-items-center rounded-2xl border border-[#cde5dd] bg-[#f7faf9] text-[#087f75] shadow-sm">
                <Icon size={20} />
              </div>
              <p className="mt-5 text-[10px] font-bold tracking-[0.16em] text-[#087f75]">
                STEP {number}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-950">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustriesSection() {
  return (
    <section className="bg-[#f1f6f4] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Markets we understand"
            title="Built for the way your industry works."
            description="Research can be tailored to the organization types, roles, and regions that matter to your next campaign."
          />
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#087f75]"
          >
            Talk through your market <ArrowRight size={15} />
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {industries.map(({ title, icon: Icon }, index) => (
            <Reveal key={title} delay={index * 0.04}>
              <div className="flex h-full min-h-[112px] flex-col justify-between rounded-xl border border-white bg-white p-4 shadow-[0_8px_24px_-22px_rgba(10,29,43,0.5)] transition hover:-translate-y-1 hover:shadow-md sm:min-h-[135px] sm:p-5">
                <span className="grid size-9 place-items-center rounded-lg bg-[#e8f5f1] text-[#087f75]">
                  <Icon size={18} />
                </span>
                <p className="mt-4 text-xs font-semibold text-slate-800 sm:text-sm">
                  {title}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
