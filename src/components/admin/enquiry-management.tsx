"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AdminAlert,
  AdminPageHeading,
  AdminSearch,
  PaginationControls,
  StatusPill,
} from "@/components/admin/admin-ui";
import { apiClient } from "@/lib/axios";

const statuses = ["new", "in_progress", "qualified", "converted", "closed", "spam"] as const;

type EnquiryItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  status: (typeof statuses)[number];
  createdAt: string;
};

type EnquiryResponse = {
  items: EnquiryItem[];
  pagination: { page: number; totalPages: number; total: number };
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "error" in error.response.data &&
    typeof error.response.data.error === "string"
  ) {
    return error.response.data.error;
  }
  return "Could not load enquiries.";
}

export default function EnquiryManagement() {
  const [data, setData] = useState<EnquiryResponse | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get<EnquiryResponse>("/enquiries", {
        params: { page, limit: 20, q: search || undefined, status: status === "all" ? undefined : status },
        signal: controller.signal,
      })
      .then(({ data: result }) => {
        setData(result);
        setError("");
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, search, status]);

  return (
    <>
      <AdminPageHeading
        eyebrow="Customer pipeline"
        title="Enquiries"
        description="Review new business requests, follow progress, and keep the pipeline current."
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5">
          <AdminSearch
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => {
              setPage(1);
              setSearch(searchInput.trim());
            }}
            placeholder="Search name, email, company…"
          />
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#087f75]"
            aria-label="Filter by enquiry status"
          >
            <option value="all">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Company / service</th>
                <th className="px-5 py-3.5">Received</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5"><span className="sr-only">Open enquiry</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.items.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{item.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-medium text-slate-800">{item.company || "—"}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{item.service}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4"><StatusPill status={item.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/enquiries/${item.id}`} className="text-xs font-semibold text-[#087f75] hover:underline">
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && data?.items.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">No enquiries match these filters.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">Loading enquiries…</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="px-4 text-xs text-slate-500 sm:px-5">
              {data.pagination.total.toLocaleString()} enquiries
            </p>
            <PaginationControls
              page={page}
              totalPages={data.pagination.totalPages}
              onChange={setPage}
            />
          </div>
        )}
      </section>
    </>
  );
}
