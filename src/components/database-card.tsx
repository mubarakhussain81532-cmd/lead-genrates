import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DatabaseProduct } from "@/lib/marketing-content";

export default function DatabaseCard({
  product,
  index,
}: {
  product: DatabaseProduct;
  index?: number;
}) {
  const Icon = product.icon;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#a6d7cd] hover:shadow-[0_20px_50px_-30px_rgba(10,29,43,0.28)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#eef7f4] via-[#f8faf9] to-[#e6f0ed] p-6">
        <div className="absolute -right-7 -top-10 size-32 rounded-full border border-[#087f75]/10 transition-transform duration-500 group-hover:scale-125" />
        <div className="absolute -right-1 -top-4 size-20 rounded-full border border-[#087f75]/10" />
        <div className="relative flex items-start justify-between">
          <span className="grid size-12 place-items-center rounded-xl bg-white text-[#087f75] shadow-sm">
            <Icon size={22} strokeWidth={1.8} />
          </span>
          <span className="rounded-full border border-[#087f75]/10 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#087f75]">
            {product.eyebrow}
          </span>
        </div>
        <p className="relative mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
          Collection {String((index ?? 0) + 1).padStart(2, "0")}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          {product.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
          {product.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2.5 py-1.5 text-[10px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href="/contact#inquiry"
          className="mt-6 inline-flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-[#087f75]"
        >
          Request details
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}
