"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/axios";
import type { ApiError } from "@/types/api";
import {
  enquirySchema,
  enquiryServices,
  type EnquiryInput,
} from "@/utils/enquiry-schema";
import type { z } from "zod";

type EnquiryFormValues = z.input<typeof enquirySchema>;
type FormFeedback = { kind: "success" | "error"; message: string };

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#55ad9b] focus:ring-4 focus:ring-[#087f75]/10";

export default function ContactInquiryForm() {
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues, undefined, EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      website: "",
    },
  });

  async function submitEnquiry(data: EnquiryInput) {
    setFeedback(null);

    try {
      const response = await apiClient.post<{ message: string }>(
        "/contact",
        data,
      );
      reset();
      setFeedback({ kind: "success", message: response.data.message });
    } catch (error) {
      const message = axios.isAxiosError<ApiError>(error)
        ? error.response?.data.error ??
          (error.request
            ? "We could not reach the server. Please try again."
            : "Your enquiry could not be submitted.")
        : "Your enquiry could not be submitted. Please try again.";
      setFeedback({ kind: "error", message });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submitEnquiry)}
      onChange={() => setFeedback(null)}
      noValidate
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(10,29,43,0.5)] sm:p-8"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#087f75]">
          Send an enquiry
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Tell us what you need.
        </h2>
      </div>

      <div
        className="absolute -left-[10000px] size-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="enquiry-website">Website</label>
        <input
          id="enquiry-website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="enquiry-name"
            className="text-xs font-semibold text-slate-700"
          >
            Full name *
          </label>
          <input
            id="enquiry-name"
            autoComplete="name"
            className={inputClassName}
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "enquiry-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="enquiry-name-error" role="alert" className="mt-1 text-xs text-rose-700">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="enquiry-company"
            className="text-xs font-semibold text-slate-700"
          >
            Company name
          </label>
          <input
            id="enquiry-company"
            autoComplete="organization"
            className={inputClassName}
            placeholder="Company name"
            {...register("company")}
          />
        </div>
        <div>
          <label
            htmlFor="enquiry-email"
            className="text-xs font-semibold text-slate-700"
          >
            Email *
          </label>
          <input
            id="enquiry-email"
            type="email"
            autoComplete="email"
            className={inputClassName}
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "enquiry-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="enquiry-email-error" role="alert" className="mt-1 text-xs text-rose-700">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="enquiry-phone"
            className="text-xs font-semibold text-slate-700"
          >
            Phone *
          </label>
          <input
            id="enquiry-phone"
            type="tel"
            autoComplete="tel"
            className={inputClassName}
            placeholder="+91 98765 43210"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "enquiry-phone-error" : undefined}
            {...register("phone")}
          />
          {errors.phone && (
            <p id="enquiry-phone-error" role="alert" className="mt-1 text-xs text-rose-700">
              {errors.phone.message}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="enquiry-service"
            className="text-xs font-semibold text-slate-700"
          >
            Interested service *
          </label>
          <select
            id="enquiry-service"
            className={inputClassName}
            defaultValue=""
            aria-invalid={Boolean(errors.service)}
            aria-describedby={
              errors.service ? "enquiry-service-error" : undefined
            }
            {...register("service")}
          >
            <option value="" disabled>
              Select a service
            </option>
            {enquiryServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          {errors.service && (
            <p
              id="enquiry-service-error"
              role="alert"
              className="mt-1 text-xs text-rose-700"
            >
              Select a service.
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="enquiry-message"
            className="text-xs font-semibold text-slate-700"
          >
            Message *
          </label>
          <textarea
            id="enquiry-message"
            rows={4}
            className={`${inputClassName} resize-y`}
            placeholder="Tell us about your audience, locations, and goals."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? "enquiry-message-error" : undefined
            }
            {...register("message")}
          />
          {errors.message && (
            <p
              id="enquiry-message-error"
              role="alert"
              className="mt-1 text-xs text-rose-700"
            >
              {errors.message.message}
            </p>
          )}
        </div>
      </div>

      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            feedback.kind === "error"
              ? "bg-rose-50 text-rose-800"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#087f75] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#05645d] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            Sending enquiry <LoaderCircle size={16} className="animate-spin" />
          </>
        ) : (
          <>
            Send enquiry <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}
