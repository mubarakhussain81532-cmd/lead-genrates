"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AdminAlert,
  AdminConfirmButton,
  AdminPageHeading,
  AdminSearch,
  FormField,
  PaginationControls,
  StatusPill,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import { apiClient } from "@/lib/axios";
import { serviceIconNames } from "@/lib/service-icons";
import { serviceInputSchema } from "@/utils/admin-schemas";

type ServiceValues = z.input<typeof serviceInputSchema>;
type ServiceItem = ServiceValues & { id: string; createdAt: string };
type ServiceList = {
  items: ServiceItem[];
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
  return "The service operation could not be completed.";
}

export default function ServiceManagement() {
  const [data, setData] = useState<ServiceList | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    apiClient.get<ServiceList>("/admin/services", {
        params: { page, limit: 20, q: search || undefined, active },
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
  }, [page, search, active, reloadKey]);

  async function setServiceActive(item: ServiceItem, isActive: boolean) {
    try {
      await apiClient.patch(`/admin/services/${item.id}`, { isActive });
      setSuccess(`Service ${isActive ? "activated" : "deactivated"}.`);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(getError(requestError));
    }
  }

  async function deleteService(item: ServiceItem) {
    setError("");
    try {
      await apiClient.delete(`/admin/services/${item.id}`);
      setSuccess("Service removed from the public website.");
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(getError(requestError));
    }
  }

  return (
    <>
      <AdminPageHeading
        eyebrow="Offerings"
        title="Services"
        description="Manage the service catalog displayed across the public website."
        action={
          <button type="button" onClick={() => { setEditing(null); setEditorOpen(true); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#087f75] px-4 text-xs font-semibold text-white hover:bg-[#05645d]">
            <Plus size={16} /> Add service
          </button>
        }
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      {success && <AdminAlert tone="success">{success}</AdminAlert>}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5">
          <AdminSearch value={searchInput} onChange={setSearchInput} onSubmit={() => { setPage(1); setSearch(searchInput.trim()); }} placeholder="Search services…" />
          <select value={active} onChange={(event) => { setPage(1); setActive(event.target.value); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none" aria-label="Filter services">
            <option value="all">All services</option><option value="true">Active</option><option value="false">Inactive</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <tr><th className="px-5 py-3.5">Service</th><th className="px-5 py-3.5">Slug</th><th className="px-5 py-3.5">Icon</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4"><p className="text-xs font-semibold text-slate-900">{item.title}</p><p className="mt-1 max-w-md truncate text-[11px] text-slate-500">{item.description}</p></td>
                  <td className="px-5 py-4 text-xs text-slate-500">{item.slug}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{item.icon}</td>
                  <td className="px-5 py-4"><StatusPill status={item.isActive ? "active" : "inactive"} /></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setEditing(item); setEditorOpen(true); }} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:text-[#087f75]" aria-label={`Edit ${item.title}`}><Pencil size={15} /></button>
                    <AdminConfirmButton confirmation={`${item.isActive ? "Deactivate" : "Activate"} ${item.title}?`} onConfirm={() => setServiceActive(item, !item.isActive)} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:text-[#087f75]">
                      {item.isActive ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                    </AdminConfirmButton>
                    {item.isActive && (
                      <AdminConfirmButton
                        confirmation={`Remove ${item.title} from the public website? The service record will be kept inactive.`}
                        onConfirm={() => deleteService(item)}
                        className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 size={15} />
                      </AdminConfirmButton>
                    )}
                  </div></td>
                </tr>
              ))}
              {loading && <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">Loading services…</td></tr>}
              {!loading && data?.items.length === 0 && <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">No services match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        {data && <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="px-4 text-xs text-slate-500 sm:px-5">{data.pagination.total} services</p><PaginationControls page={page} totalPages={data.pagination.totalPages} onChange={setPage} /></div>}
      </section>
      {editorOpen && <ServiceEditor item={editing} onClose={() => setEditorOpen(false)} onSaved={(message) => { setEditorOpen(false); setSuccess(message); setReloadKey((current) => current + 1); }} />}
    </>
  );
}

function ServiceEditor({
  item,
  onClose,
  onSaved,
}: {
  item: ServiceItem | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ServiceValues>({
    resolver: zodResolver(serviceInputSchema),
    defaultValues: item
      ? { title: item.title, description: item.description, slug: item.slug, icon: item.icon, isActive: item.isActive }
      : { title: "", description: "", slug: "", icon: "Network", isActive: true },
  });

  async function save(values: ServiceValues) {
    setSaving(true);
    setError("");
    try {
      if (item) await apiClient.patch(`/admin/services/${item.id}`, values);
      else await apiClient.post("/admin/services", values);
      onSaved(item ? "Service updated." : "Service created.");
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/50 p-4">
      <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <h2 className="text-base font-semibold">{item ? "Edit service" : "Add service"}</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close service editor"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(save)} className="space-y-4 p-5 sm:p-7">
          {error && <AdminAlert>{error}</AdminAlert>}
          <FormField label="Service name" error={errors.title?.message}>
            <input {...register("title", { onChange: (event) => setValue("slug", event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) })} className={adminInputClass} />
          </FormField>
          <FormField label="URL slug" error={errors.slug?.message}><input {...register("slug")} className={adminInputClass} /></FormField>
          <FormField label="Description" error={errors.description?.message}><textarea {...register("description")} rows={4} className={adminTextareaClass} /></FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Card icon" error={errors.icon?.message}>
              <select {...register("icon")} className={adminInputClass}>{serviceIconNames.map((name) => <option key={name} value={name}>{name}</option>)}</select>
            </FormField>
            <label className="flex items-center gap-2 self-end pb-3 text-xs font-medium text-slate-700"><input type="checkbox" {...register("isActive")} className="size-4 accent-[#087f75]" />Visible on website</label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="h-10 rounded-lg bg-[#087f75] px-5 text-xs font-semibold text-white hover:bg-[#05645d] disabled:opacity-50">{saving ? "Saving…" : item ? "Save changes" : "Create service"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
