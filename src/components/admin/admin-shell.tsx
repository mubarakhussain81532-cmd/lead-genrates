"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings2,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/axios";
import type { AdminIdentity } from "@/types/admin";

const navigation = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquareText },
  { href: "/admin/products", label: "Database products", icon: Boxes, managersOnly: true },
  { href: "/admin/services", label: "Services", icon: BriefcaseBusiness, managersOnly: true },
  { href: "/admin/downloads", label: "Downloads", icon: FileText },
  { href: "/admin/content", label: "Website content", icon: Settings2, managersOnly: true },
];

export default function AdminShell({
  admin,
  children,
}: {
  admin: AdminIdentity;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      await apiClient.post("/admin/logout", {});
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Sign out failed. Please try again.");
      setSigningOut(false);
    }
  }

  const isManager = admin.role !== "support";
  const links = navigation.filter((item) => !item.managersOnly || isManager);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#0a1d2b] text-[#81dfc7]">
              <BarChart3 size={20} />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight">
                eCore <span className="text-[#087f75]">Business</span>
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Admin workspace
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-6">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <nav className="mt-3 space-y-1" aria-label="Admin navigation">
            {links.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition ${
                    active
                      ? "bg-[#eaf5f2] text-[#087f75]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0a1d2b] text-xs font-bold text-white">
              {admin.name
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{admin.name}</span>
              <span className="mt-0.5 block text-[10px] capitalize text-slate-500">
                {admin.role}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
          >
            <LogOut size={16} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
          {error && <p className="px-3 pt-2 text-xs text-rose-700">{error}</p>}
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                eCore CRM
              </p>
              <p className="mt-1 text-sm font-semibold">
                {links.find((item) => pathname.startsWith(item.href))?.label ?? "Admin workspace"}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-500 sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" />
            Secure session
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
