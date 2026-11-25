"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BarChart3, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/marketing-content";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-3"
          aria-label="eCore Business home"
          onClick={closeMenu}
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#0a1d2b] text-[#81dfc7] transition-transform group-hover:rotate-[-5deg]">
            <BarChart3 size={21} strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-[-0.04em] text-slate-950">
              eCore <span className="text-[#087f75]">Business</span>
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Data for better decisions
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-slate-600 transition-colors hover:text-[#087f75]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact#inquiry"
          className="hidden items-center gap-2 rounded-full bg-[#087f75] px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#05645d] md:inline-flex"
        >
          Discuss a project <ArrowRight size={14} />
        </Link>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-800 md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg md:hidden"
          aria-label="Mobile"
        >
          <div className="mx-auto flex max-w-7xl flex-col">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="border-b border-slate-100 py-3.5 text-sm font-medium text-slate-700 last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact#inquiry"
              onClick={closeMenu}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#087f75] px-5 py-3 text-sm font-semibold text-white"
            >
              Discuss a project <ArrowRight size={15} />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
