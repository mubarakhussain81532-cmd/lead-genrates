import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/reveal";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a1d2b] text-white">
      <div className="absolute -left-40 top-0 size-[460px] rounded-full bg-[#087f75]/20 blur-[100px]" />
      <div className="absolute -right-36 bottom-[-14rem] size-[520px] rounded-full bg-[#4bb99c]/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-4 lg:px-10 lg:pb-24 lg:pt-20">
        <Reveal className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#c2e9dc] sm:text-[11px]">
            <span className="size-1.5 rounded-full bg-[#65d5b3]" />
            Business intelligence for growth
          </div>
          <h1 className="mt-7 max-w-[650px] text-[42px] font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-[68px]">
            Meet your next best customer.
            <span className="mt-1 block bg-gradient-to-r from-[#9ae4cc] to-[#51c6a6] bg-clip-text text-transparent">
              Start with better data.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Targeted business information, careful research, and dependable
            sales support—built around the market you want to reach.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/databases"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#7edfc2] px-6 text-sm font-bold text-[#09232c] transition hover:-translate-y-0.5 hover:bg-[#a1efd6]"
            >
              Explore databases <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact#inquiry"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/[0.07]"
            >
              Discuss your requirements
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-300">
            {["Research-led", "Brief-specific", "Ready for your workflow"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check size={14} className="text-[#79d9bb]" />
                  {item}
                </span>
              ),
            )}
          </div>
          <Link
            href="#company"
            className="mt-10 hidden items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-white sm:inline-flex"
          >
            Discover our approach <ArrowDown size={14} />
          </Link>
        </Reveal>

        <Reveal className="relative mx-auto w-full max-w-[640px]" delay={0.12}>
          <div className="absolute inset-8 rounded-[2rem] bg-[#35b997]/15 blur-3xl" />
          <Image
            src="/images/market-intelligence.svg"
            alt="Illustration of a business intelligence dashboard and connected market data"
            width={840}
            height={680}
            priority
            className="relative h-auto w-full rounded-[1.75rem] border border-white/10 shadow-[0_35px_80px_-40px_rgba(0,0,0,0.65)]"
          />
          <div className="absolute -bottom-4 left-4 rounded-2xl border border-white/10 bg-[#102a38]/95 p-4 shadow-xl backdrop-blur sm:bottom-7 sm:-left-5 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#68d4b3]/15 text-[#8de4c8]">
                <Check size={19} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">
                  Built around your brief
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  A more focused route to market
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <div className="relative mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:px-10 lg:pb-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <p className="pt-6 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          A practical partner for teams across industries
        </p>
      </div>
    </section>
  );
}
