"use client";

import { ArrowDownToLine, ArrowUpRight, Boxes, MessageSquareText, Sparkles, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminAlert, AdminPageHeading } from "@/components/admin/admin-ui";
import { apiClient } from "@/lib/axios";

type DashboardData = {
  stats: {
    totalEnquiries: number;
    newEnquiries: number;
    contactedEnquiries: number;
    convertedEnquiries: number;
    contactSubmissions: number;
    totalProducts: number;
    totalDownloads: number;
    newsletterSubscriptions: number;
  };
  trend: Array<{ date: string; enquiries: number; downloads: number }>;
  latestSubmissions: Array<{
    id: string;
    type: string;
    name: string;
    email: string;
    detail: string;
    createdAt: string;
  }>;
};

const statCards = [
  { key: "totalEnquiries", label: "Total enquiries", icon: MessageSquareText, color: "bg-blue-50 text-blue-700" },
  { key: "newEnquiries", label: "New enquiries", icon: Sparkles, color: "bg-violet-50 text-violet-700" },
  { key: "contactedEnquiries", label: "Contacted", icon: UsersRound, color: "bg-amber-50 text-amber-700" },
  { key: "convertedEnquiries", label: "Converted", icon: ArrowUpRight, color: "bg-emerald-50 text-emerald-700" },
  { key: "contactSubmissions", label: "Contact submissions", icon: MessageSquareText, color: "bg-indigo-50 text-indigo-700" },
  { key: "totalProducts", label: "Active products", icon: Boxes, color: "bg-cyan-50 text-cyan-700" },
  { key: "totalDownloads", label: "Sample requests", icon: ArrowDownToLine, color: "bg-rose-50 text-rose-700" },
  { key: "newsletterSubscriptions", label: "Newsletter subscribers", icon: UsersRound, color: "bg-teal-50 text-teal-700" },
] as const;

function TrendChart({ points }: { points: DashboardData["trend"] }) {
  const width = 720;
  const height = 220;
  const padding = 22;
  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => [point.enquiries, point.downloads]),
  );
  const line = (key: "enquiries" | "downloads") =>
    points
      .map((point, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
        const y = height - padding - (point[key] / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className="overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full" role="img" aria-label="Seven-day enquiry and sample request trend">
        {[0, 1, 2, 3].map((lineIndex) => {
          const y = padding + (lineIndex * (height - padding * 2)) / 3;
          return <line key={lineIndex} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e8edf2" strokeDasharray="4 6" />;
        })}
        <polyline points={line("enquiries")} fill="none" stroke="#087f75" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={line("downloads")} fill="none" stroke="#7c8cf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
          return (
            <text key={point.date} x={x} y={height - 2} textAnchor="middle" fill="#94a3b8" fontSize="10">
              {new Date(`${point.date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "short" })}
            </text>
          );
        })}
      </svg>
      <div className="mt-2 flex gap-5 text-[11px] font-medium text-slate-500">
        <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#087f75]" />Enquiries</span>
        <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#7c8cf8]" />Sample requests</span>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get<DashboardData>("/admin/dashboard", { signal: controller.signal })
      .then(({ data: result }) => setData(result))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            typeof requestError === "object" &&
              requestError !== null &&
              "response" in requestError &&
              typeof requestError.response === "object" &&
              requestError.response !== null &&
              "data" in requestError.response &&
              typeof requestError.response.data === "object" &&
              requestError.response.data !== null &&
              "error" in requestError.response.data &&
              typeof requestError.response.data.error === "string"
              ? requestError.response.data.error
              : "Could not load dashboard data.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <AdminPageHeading
        eyebrow="Your business at a glance"
        title="Dashboard"
        description="Track enquiries, products, and sample interest from one workspace."
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => <div key={card.key} className="h-32 animate-pulse rounded-2xl bg-white" />)}
        </div>
      )}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map(({ key, label, icon: Icon, color }) => (
              <article key={key} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-500">{label}</span>
                  <span className={`grid size-9 place-items-center rounded-xl ${color}`}><Icon size={17} /></span>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                  {data.stats[key].toLocaleString()}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">Current total</p>
              </article>
            ))}
          </div>
          <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-900">Activity overview</p>
              <p className="mt-1 text-xs text-slate-500">Enquiries and sample requests over the last seven days</p>
            </div>
            <TrendChart points={data.trend} />
          </section>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:px-7">
              <p className="text-sm font-semibold text-slate-900">Latest submissions</p>
              <p className="mt-1 text-xs text-slate-500">
                Recent enquiries, contact requests, sample requests, and subscriptions
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {data.latestSubmissions.map((item) => (
                <article
                  key={`${item.type}-${item.id}`}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {item.email} · {item.detail}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[11px] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                      {item.type}
                    </span>
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>
                </article>
              ))}
              {data.latestSubmissions.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-slate-500">
                  No submissions yet.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
