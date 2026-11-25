import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { getPublicSiteContent } from "@/lib/public-content";

export async function ContactWays() {
  const { contact } = await getPublicSiteContent();
  return (
    <div className="mt-8 space-y-3">
      <a
        href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#9dd5c9] sm:p-5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8f5f1] text-[#087f75]">
          <Phone size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Call our team
          </span>
          <span className="mt-1 block text-sm font-semibold text-slate-900">
            {contact.phone}
          </span>
        </span>
        <ArrowUpRight
          size={16}
          className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#087f75]"
        />
      </a>
      <a
        href={`mailto:${contact.email}?subject=Business%20data%20requirement`}
        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#9dd5c9] sm:p-5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8f5f1] text-[#087f75]">
          <Mail size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Email sales
          </span>
          <span className="mt-1 block break-all text-sm font-semibold text-slate-900">
            {contact.email}
          </span>
        </span>
        <ArrowUpRight
          size={16}
          className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#087f75]"
        />
      </a>
    </div>
  );
}

export async function OfficeCards() {
  const { contact } = await getPublicSiteContent();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {contact.offices.map((office) => (
        <article
          key={office.title}
          className="rounded-2xl border border-slate-200 p-5 sm:p-6"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#087f75]">
            {office.title}
          </p>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-800">
            {office.address}
          </p>
          <p className="text-sm leading-6 text-slate-600">{office.city}</p>
        </article>
      ))}
    </div>
  );
}

export async function ContactEmailCta() {
  const { contact } = await getPublicSiteContent();
  return (
    <a
      href={`mailto:${contact.email}?subject=Business%20data%20requirement`}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#087f75] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#05645d]"
    >
      Email your requirement <ArrowUpRight size={15} />
    </a>
  );
}
