import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { navLinks } from "@/lib/marketing-content";
import { getPublicSiteContent } from "@/lib/public-content";

async function FooterContact() {
  const { contact } = await getPublicSiteContent();
  return (
    <ul className="mt-5 space-y-4 text-sm text-slate-300">
      <li className="flex items-start gap-3">
        <Phone className="mt-0.5 shrink-0 text-[#81dfc7]" size={16} />
        <a
          href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
          className="hover:text-white"
        >
          {contact.phone}
        </a>
      </li>
      <li className="flex items-start gap-3">
        <Mail className="mt-0.5 shrink-0 text-[#81dfc7]" size={16} />
        <a href={`mailto:${contact.email}`} className="break-all hover:text-white">
          {contact.email}
        </a>
      </li>
      <li className="flex items-start gap-3">
        <MapPin className="mt-0.5 shrink-0 text-[#81dfc7]" size={16} />
        <span>{contact.offices.map((office) => office.city).join(" · ")}</span>
      </li>
    </ul>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-[#0a1d2b] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_0.8fr_1fr] lg:px-10 lg:py-20">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#81dfc7]">
              <ArrowUpRight size={20} />
            </span>
            <span className="text-base font-bold tracking-tight">
              eCore <span className="text-[#81dfc7]">Business</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
            Business information and practical data support, shaped around the
            audiences your team wants to reach.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-5 space-y-3">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-slate-300 transition hover:text-[#81dfc7]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Talk to our team</h2>
          <Suspense
            fallback={
              <div className="mt-5 h-24 animate-pulse rounded-xl bg-white/10" />
            }
          >
            <FooterContact />
          </Suspense>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-400 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>© eCore Business. All rights reserved.</p>
          <p>Thoughtful research. Useful business connections.</p>
        </div>
      </div>
    </footer>
  );
}
