import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import Reveal from "@/components/reveal";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0a1d2b] text-white">
      <div className="absolute -right-36 -top-56 size-[540px] rounded-full border border-white/[0.07]" />
      <div className="absolute -right-16 -top-36 size-[380px] rounded-full border border-white/[0.07]" />
      <div className="absolute -left-36 bottom-[-18rem] size-[460px] rounded-full bg-[#087f75]/20 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <Reveal>
          <nav
            aria-label="Breadcrumb"
            className="mb-9 flex items-center gap-2 text-[11px] text-slate-400"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight size={13} />
            <span className="text-slate-200">{eyebrow}</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8ce2ce]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {description}
          </p>
          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8ce2ce] px-5 py-3 text-sm font-bold text-[#0a1d2b] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {actionLabel} <ArrowRight size={15} />
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
