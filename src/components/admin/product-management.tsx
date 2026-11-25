"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Plus, Pencil, ToggleLeft, ToggleRight, Trash2, Upload, X } from "lucide-react";
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

const productEditorSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(2000),
    category: z.string().trim().min(2).max(80),
    isActive: z.boolean(),
  })
  .strict();

type ProductValues = z.infer<typeof productEditorSchema>;
type ProductItem = ProductValues & {
  id: string;
  image: string;
  sampleAvailable: boolean;
  createdAt: string;
};
type ProductList = {
  items: ProductItem[];
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
  return "The product operation could not be completed.";
}

export default function ProductManagement() {
  const [data, setData] = useState<ProductList | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    apiClient.get<ProductList>("/admin/products", {
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

  async function setProductActive(item: ProductItem, isActive: boolean) {
    setError("");
    setSuccess("");
    try {
      await apiClient.patch(`/products/${item.id}`, { isActive });
      setSuccess(`Product ${isActive ? "activated" : "deactivated"}.`);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(getError(requestError));
    }
  }

  async function deleteProduct(item: ProductItem) {
    setError("");
    setSuccess("");
    try {
      await apiClient.delete(`/products/${item.id}`);
      setSuccess("Product removed from the active catalog.");
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(getError(requestError));
    }
  }

  return (
    <>
      <AdminPageHeading
        eyebrow="Catalog management"
        title="Database products"
        description="Create product listings, attach private sample files, and control catalog visibility."
        action={
          <button
            type="button"
            onClick={() => { setEditing(null); setEditorOpen(true); }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#087f75] px-4 text-xs font-semibold text-white transition hover:bg-[#05645d]"
          >
            <Plus size={16} /> Add product
          </button>
        }
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      {success && <AdminAlert tone="success">{success}</AdminAlert>}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5">
          <AdminSearch
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => { setPage(1); setSearch(searchInput.trim()); }}
            placeholder="Search products…"
          />
          <select
            value={active}
            onChange={(event) => { setPage(1); setActive(event.target.value); }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#087f75]"
            aria-label="Filter products by active status"
          >
            <option value="all">All products</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Sample</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Image src={item.image} alt="" width={44} height={44} unoptimized className="size-11 rounded-xl border border-slate-100 bg-slate-50 object-cover" />
                      <span>
                        <span className="block text-xs font-semibold text-slate-900">{item.name}</span>
                        <span className="mt-1 block max-w-xs truncate text-[11px] text-slate-500">{item.description}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">{item.category}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{item.sampleAvailable ? "Available" : "Not added"}</td>
                  <td className="px-5 py-4"><StatusPill status={item.isActive ? "active" : "inactive"} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditing(item); setEditorOpen(true); }}
                        className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-[#087f75]"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductActive(item, !item.isActive)}
                        className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-[#087f75]"
                        aria-label={`${item.isActive ? "Deactivate" : "Activate"} ${item.name}`}
                      >
                        {item.isActive ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                      </button>
                      {item.isActive && (
                        <AdminConfirmButton
                          confirmation={`Remove ${item.name} from the active catalog? Existing request history will be preserved.`}
                          onConfirm={() => deleteProduct(item)}
                          className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 size={15} />
                        </AdminConfirmButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">Loading products…</td></tr>}
              {!loading && data?.items.length === 0 && <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">No products match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="px-4 text-xs text-slate-500 sm:px-5">{data.pagination.total.toLocaleString()} products</p>
            <PaginationControls page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
          </div>
        )}
      </section>
      {editorOpen && (
        <ProductEditor
          item={editing}
          onClose={() => setEditorOpen(false)}
          onSaved={(message) => { setEditorOpen(false); setSuccess(message); setReloadKey((current) => current + 1); }}
        />
      )}
    </>
  );
}

function ProductEditor({
  item,
  onClose,
  onSaved,
}: {
  item: ProductItem | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [removeSample, setRemoveSample] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductValues>({
    resolver: zodResolver(productEditorSchema),
    defaultValues: item
      ? {
          name: item.name,
          description: item.description,
          category: item.category,
          isActive: item.isActive,
        }
      : { name: "", description: "", category: "", isActive: true },
  });

  async function upload(file: File, kind: "image" | "sample"): Promise<string> {
    const { data: ticket } = await apiClient.post<{
      key: string;
      url: string;
      headers: Record<string, string>;
    }>(
      `/admin/uploads?kind=${kind}`,
      { contentType: file.type, size: file.size },
    );
    const uploaded = await fetch(ticket.url, {
      method: "PUT",
      headers: ticket.headers,
      body: file,
    });
    if (!uploaded.ok) {
      throw new Error("The file could not be uploaded to private storage.");
    }

    const { data } = await apiClient.post<{ key: string }>(
      "/admin/uploads/complete",
      {
        kind,
        key: ticket.key,
        contentType: file.type,
        size: file.size,
      },
    );
    return data.key;
  }

  async function save(values: ProductValues) {
    setUploadError("");
    if (!item && !imageFile) {
      setUploadError("Choose a product image before creating the listing.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...values };
      if (imageFile) payload.image = await upload(imageFile, "image");
      if (sampleFile) payload.sampleFile = await upload(sampleFile, "sample");
      if (removeSample) payload.sampleFile = null;
      if (item) {
        await apiClient.patch(`/products/${item.id}`, payload);
      } else {
        await apiClient.post("/products", payload);
      }
      onSaved(item ? "Product updated." : "Product created.");
    } catch (error) {
      setUploadError(getError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/50 p-4">
      <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-base font-semibold">{item ? "Edit database product" : "Add database product"}</h2>
            <p className="mt-1 text-[11px] text-slate-500">Product files are uploaded to private object storage.</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close editor"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(save)} className="space-y-4 p-5 sm:p-7">
          {uploadError && <AdminAlert>{uploadError}</AdminAlert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Product name" error={errors.name?.message}>
              <input {...register("name")} className={adminInputClass} />
            </FormField>
            <FormField label="Category" error={errors.category?.message}>
              <input {...register("category")} className={adminInputClass} />
            </FormField>
          </div>
          <FormField label="Description" error={errors.description?.message}>
            <textarea {...register("description")} className={adminTextareaClass} rows={4} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={item ? "Replace product image (optional)" : "Product image (JPEG, PNG, WebP; up to 5 MB)"}>
              <span className="flex min-h-11 items-center gap-3 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-normal text-slate-500">
                <Upload size={15} />
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="min-w-0 flex-1 text-[11px]" />
              </span>
              {imageFile && <span className="mt-1 block text-[10px] text-slate-500">{imageFile.name}</span>}
            </FormField>
            <FormField label="Sample file (PDF, XLS, XLSX; up to 20 MB)">
              <span className="flex min-h-11 items-center gap-3 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-normal text-slate-500">
                <Upload size={15} />
                <input type="file" accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { setSampleFile(event.target.files?.[0] ?? null); setRemoveSample(false); }} className="min-w-0 flex-1 text-[11px]" />
              </span>
              {sampleFile && <span className="mt-1 block text-[10px] text-slate-500">{sampleFile.name}</span>}
            </FormField>
          </div>
          {item?.sampleAvailable && (
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={removeSample} onChange={(event) => setRemoveSample(event.target.checked)} />
              Remove the current sample from this product
            </label>
          )}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <input type="checkbox" {...register("isActive")} className="size-4 accent-[#087f75]" />
            Product is active and visible in the public catalog
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="h-10 rounded-lg bg-[#087f75] px-5 text-xs font-semibold text-white hover:bg-[#05645d] disabled:opacity-50">
              {saving ? "Saving…" : item ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
