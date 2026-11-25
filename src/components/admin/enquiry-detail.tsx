"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AdminAlert,
  AdminConfirmButton,
  AdminPageHeading,
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

function getRequestError(error: unknown): string {
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
  return "The request could not be completed.";
}

export default function EnquiryDetail({ id }: { id: string }) {
  const router = useRouter();
  const [item, setItem] = useState<EnquiryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get<{ item: EnquiryItem }>(`/enquiries/${id}`, { signal: controller.signal })
      .then(({ data }) => setItem(data.item))
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(getRequestError(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  async function updateStatus(status: EnquiryItem["status"]) {
    if (!item) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await apiClient.patch<{ item: EnquiryItem }>(
        `/enquiries/${id}`,
        { status },
      );
      setItem(data.item);
      setSuccess("Enquiry status updated.");
    } catch (requestError: unknown) {
      setError(getRequestError(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function deleteEnquiry() {
    setError("");
    try {
      await apiClient.delete(`/enquiries/${id}`);
      router.replace("/admin/enquiries");
      router.refresh();
    } catch (requestError: unknown) {
      setError(getRequestError(requestError));
    }
  }

  return (
    <>
      <Link href="/admin/enquiries" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#087f75]">
        <ArrowLeft size={15} /> Back to enquiries
      </Link>
      {loading && <div className="h-64 animate-pulse rounded-2xl bg-white" />}
      {error && <AdminAlert>{error}</AdminAlert>}
      {success && <AdminAlert tone="success">{success}</AdminAlert>}
      {item && (
        <>
          <AdminPageHeading
            eyebrow="Enquiry details"
            title={item.name}
            description={`Received ${new Date(item.createdAt).toLocaleString()}`}
            action={
              <AdminConfirmButton
                confirmation={`Delete the enquiry from ${item.name}? This action cannot be undone.`}
                onConfirm={deleteEnquiry}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                <Trash2 size={15} /> Delete
              </AdminConfirmButton>
            }
          />
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-sm font-semibold">Message</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.message}</p>
            </section>
            <aside className="space-y-5">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold">Contact information</h2>
                <dl className="mt-4 space-y-4 text-xs">
                  <div><dt className="text-slate-400">Email</dt><dd className="mt-1 break-all font-medium text-slate-800"><a href={`mailto:${item.email}`} className="hover:text-[#087f75]">{item.email}</a></dd></div>
                  <div><dt className="text-slate-400">Phone</dt><dd className="mt-1 font-medium text-slate-800"><a href={`tel:${item.phone}`} className="hover:text-[#087f75]">{item.phone}</a></dd></div>
                  <div><dt className="text-slate-400">Company</dt><dd className="mt-1 font-medium text-slate-800">{item.company || "Not provided"}</dd></div>
                  <div><dt className="text-slate-400">Interested service</dt><dd className="mt-1 font-medium text-slate-800">{item.service}</dd></div>
                </dl>
              </section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">Pipeline status</h2>
                  <StatusPill status={item.status} />
                </div>
                <label className="mt-4 block text-xs font-semibold text-slate-600">
                  Update status
                  <select
                    value={item.status}
                    disabled={saving}
                    onChange={(event) => updateStatus(event.target.value as EnquiryItem["status"])}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium capitalize outline-none focus:border-[#087f75] disabled:opacity-50"
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                  </select>
                </label>
              </section>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
