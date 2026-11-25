"use client";

import { useEffect, useState } from "react";
import {
  AdminAlert,
  AdminPageHeading,
  AdminSearch,
  PaginationControls,
} from "@/components/admin/admin-ui";
import { apiClient } from "@/lib/axios";

type DownloadRequestItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  productName: string;
  createdAt: string;
};

type DownloadResponse = {
  items: DownloadRequestItem[];
  pagination: { page: number; totalPages: number; total: number };
};

function getError(error: unknown): string {
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
  ) return error.response.data.error;
  return "Could not load sample requests.";
}

export default function DownloadManagement() {
  const [data, setData] = useState<DownloadResponse | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get<DownloadResponse>("/download-requests", {
        params: { page, limit: 20, q: search || undefined },
        signal: controller.signal,
      })
      .then(({ data: result }) => {
        setData(result);
        setError("");
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(getError(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, search]);

  return (
    <>
      <AdminPageHeading
        eyebrow="Customer activity"
        title="Sample downloads"
        description="Review the customer and product details captured when sample files are requested."
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex border-b border-slate-100 p-4 sm:px-5">
          <AdminSearch
            value={input}
            onChange={setInput}
            onSubmit={() => { setPage(1); setSearch(input.trim()); }}
            placeholder="Search customer, email, company…"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Company</th>
                <th className="px-5 py-3.5">Database</th>
                <th className="px-5 py-3.5">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{item.email}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{item.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">{item.company || "—"}</td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-800">{item.productName}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && data?.items.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-14 text-center text-sm text-slate-500">No sample requests found.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={4} className="px-5 py-14 text-center text-sm text-slate-500">Loading sample requests…</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="px-4 text-xs text-slate-500 sm:px-5">{data.pagination.total.toLocaleString()} sample requests</p>
            <PaginationControls page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
          </div>
        )}
      </section>
    </>
  );
}
