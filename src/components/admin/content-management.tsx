"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  AdminAlert,
  AdminPageHeading,
  FormField,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import { apiClient } from "@/lib/axios";
import { defaultSiteContent } from "@/lib/default-site-content";
import { siteContentSchema } from "@/utils/admin-schemas";

type ContentValues = z.input<typeof siteContentSchema>;

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
  return "Could not save website content.";
}

export default function ContentManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContentValues>({
    resolver: zodResolver(siteContentSchema),
    defaultValues: defaultSiteContent,
  });
  const offices = useFieldArray({ control, name: "contact.offices" });
  const faqs = useFieldArray({ control, name: "faqs" });
  const testimonials = useFieldArray({ control, name: "testimonials" });

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get<{ item: ContentValues }>("/admin/content", { signal: controller.signal })
      .then(({ data }) => {
        reset({
          contact: {
            phone: data.item.contact.phone,
            email: data.item.contact.email,
            offices: data.item.contact.offices,
          },
          faqs: data.item.faqs,
          testimonials: data.item.testimonials,
        });
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(getError(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reset]);

  async function save(values: ContentValues) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiClient.patch("/admin/content", values);
      setSuccess("Website content saved and published.");
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeading
        eyebrow="Public website"
        title="Content management"
        description="Update contact details, FAQs, and testimonials shown on the public website."
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      {success && <AdminAlert tone="success">{success}</AdminAlert>}
      {loading ? (
        <div className="h-80 animate-pulse rounded-2xl bg-white" />
      ) : (
        <form onSubmit={handleSubmit(save)} className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <h2 className="text-sm font-semibold">Contact information</h2>
              <p className="mt-1 text-xs text-slate-500">Used by the contact page and website footer.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Phone number" error={errors.contact?.phone?.message}>
                <input {...register("contact.phone")} className={adminInputClass} />
              </FormField>
              <FormField label="Sales email" error={errors.contact?.email?.message}>
                <input {...register("contact.email")} type="email" className={adminInputClass} />
              </FormField>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div><h3 className="text-xs font-semibold">Office locations</h3><p className="mt-1 text-[11px] text-slate-500">At least one office is required.</p></div>
              <button type="button" onClick={() => offices.append({ title: "", address: "", city: "" })} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Plus size={14} /> Add office</button>
            </div>
            <div className="mt-3 space-y-3">
              {offices.fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-xl border border-slate-100 p-3 sm:grid-cols-[0.8fr_1.2fr_1fr_auto]">
                  <input aria-label="Office title" {...register(`contact.offices.${index}.title`)} placeholder="Office type" className={adminInputClass} />
                  <input aria-label="Street address" {...register(`contact.offices.${index}.address`)} placeholder="Street address" className={adminInputClass} />
                  <input aria-label="City" {...register(`contact.offices.${index}.city`)} placeholder="City / region" className={adminInputClass} />
                  <button type="button" onClick={() => offices.remove(index)} className="grid size-10 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Remove office"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><h2 className="text-sm font-semibold">Frequently asked questions</h2><p className="mt-1 text-xs text-slate-500">Shown in the homepage FAQ section.</p></div>
              <button type="button" onClick={() => faqs.append({ question: "", answer: "" })} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Plus size={14} /> Add FAQ</button>
            </div>
            <div className="space-y-4">
              {faqs.fields.map((field, index) => (
                <article key={field.id} className="grid gap-3 rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500">Question {index + 1}</p>
                    <button type="button" onClick={() => faqs.remove(index)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Remove FAQ"><Trash2 size={14} /></button>
                  </div>
                  <input {...register(`faqs.${index}.question`)} placeholder="Question" className={adminInputClass} />
                  <textarea {...register(`faqs.${index}.answer`)} rows={3} placeholder="Answer" className={adminTextareaClass} />
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><h2 className="text-sm font-semibold">Testimonials</h2><p className="mt-1 text-xs text-slate-500">Use only approved customer quotes.</p></div>
              <button type="button" onClick={() => testimonials.append({ quote: "", name: "", role: "" })} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Plus size={14} /> Add testimonial</button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {testimonials.fields.map((field, index) => (
                <article key={field.id} className="space-y-3 rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500">Testimonial {index + 1}</p>
                    <button type="button" onClick={() => testimonials.remove(index)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Remove testimonial"><Trash2 size={14} /></button>
                  </div>
                  <textarea {...register(`testimonials.${index}.quote`)} rows={4} placeholder="Customer quote" className={adminTextareaClass} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input {...register(`testimonials.${index}.name`)} placeholder="Customer name" className={adminInputClass} />
                    <input {...register(`testimonials.${index}.role`)} placeholder="Role / company" className={adminInputClass} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          {Object.keys(errors).length > 0 && (
            <AdminAlert>Please correct the highlighted fields before saving. Each FAQ and testimonial needs complete text; field limits are checked on save.</AdminAlert>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#087f75] px-5 text-xs font-semibold text-white hover:bg-[#05645d] disabled:opacity-50">
              <Save size={15} />{saving ? "Publishing…" : "Save and publish"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
