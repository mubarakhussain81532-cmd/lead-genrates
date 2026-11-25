import Link from "next/link";
import { ArrowRight, ArrowUpRight, Quote, ShieldCheck } from "lucide-react";
import FaqAccordion from "@/components/faq-accordion";
import Reveal from "@/components/reveal";
import SectionHeading from "@/components/section-heading";
import { getPublicSiteContent } from "@/lib/public-content";

export async function TestimonialsSection() {
  const { testimonials } = await getPublicSiteContent();

  return (
    <section className="bg-[#f1f6f4] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="A thoughtful partnership"
            title="Good work starts with listening."
            description="The strongest data programs begin by understanding what your team needs to accomplish."
            align="center"
          />
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.role} delay={index * 0.06}>
              <figure className="flex h-full flex-col rounded-2xl border border-white bg-white p-6 shadow-[0_12px_35px_-30px_rgba(10,29,43,0.45)] sm:p-7">
                <Quote size={22} className="text-[#087f75]/50" />
                <blockquote className="mt-5 flex-1 text-sm leading-7 text-slate-700">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{item.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {testimonials.every(
          (item) => item.name === "Illustrative client perspective",
        ) && (
          <p className="mt-5 text-center text-[10px] text-slate-500">
            Illustrative perspectives shown for layout; replace with approved
            client testimonials before launch.
          </p>
        )}
      </div>
    </section>
  );
}

export async function FaqSection() {
  const { faqs } = await getPublicSiteContent();

  return (
    <section id="faq" className="scroll-mt-24 bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Frequently asked"
            title="A few helpful answers before we begin."
            description="Every project is different. These are some of the questions teams often bring to an initial conversation."
          />
          <div className="mt-6 inline-flex items-start gap-3 rounded-xl bg-[#eff7f4] p-4">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#087f75]" size={18} />
            <p className="text-xs leading-5 text-slate-600">
              Data scope and intended use are discussed before research begins.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <FaqAccordion items={faqs} />
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#087f75]"
          >
            Ask us another question <ArrowUpRight size={14} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="overflow-hidden bg-[#0a1d2b] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#123343] to-[#0d2634] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute -right-12 -top-32 size-80 rounded-full border border-white/[0.07]" />
          <div className="absolute -right-2 -top-20 size-60 rounded-full border border-white/[0.07]" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8ce2ce]">
                Let’s talk about your market
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl">
                Bring us your brief. We’ll help shape the next step.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                Tell us who you want to reach and what you want to accomplish.
                We’ll start with a focused conversation.
              </p>
            </div>
            <Link
              href="/contact#inquiry"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#8ce2ce] px-6 py-3.5 text-sm font-bold text-[#0a1d2b] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Start a conversation <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
