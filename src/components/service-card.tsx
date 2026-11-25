import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServiceItem } from "@/lib/marketing-content";

export default function ServiceCard({ service }: { service: ServiceItem }) {
  const Icon = service.icon;

  return (
    <Link
      href={`/services#${service.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#9dd5c9] hover:shadow-[0_20px_50px_-30px_rgba(10,29,43,0.3)] sm:p-7"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-[#e8f5f1] text-[#087f75] transition group-hover:bg-[#087f75] group-hover:text-white">
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-950">
        {service.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
        {service.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#087f75]">
        Explore service
        <ArrowUpRight
          size={14}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </Link>
  );
}
