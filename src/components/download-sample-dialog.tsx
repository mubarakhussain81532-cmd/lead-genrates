"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowDownToLine, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/axios";
import type { ApiError, PublicProduct } from "@/types/api";
import {
  downloadRequestSchema,
  type DownloadRequestInput,
} from "@/utils/product-schema";
import type { z } from "zod";

type DownloadFormValues = z.input<typeof downloadRequestSchema>;
type DownloadResponse = {
  message: string;
  downloadUrl: string | null;
  expiresInSeconds: number | null;
};

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#55ad9b] focus:ring-4 focus:ring-[#087f75]/10";

export default function DownloadSampleDialog({
  product,
}: {
  product: PublicProduct;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DownloadFormValues, undefined, DownloadRequestInput>({
    resolver: zodResolver(downloadRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      productId: product.id,
      website: "",
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function openDialog() {
    if (successMessage) {
      reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        productId: product.id,
        website: "",
      });
      setSuccessMessage(null);
      setDownloadUrl(null);
    }
    setErrorMessage(null);
    setIsOpen(true);
  }

  async function submitRequest(data: DownloadRequestInput) {
    setErrorMessage(null);
    setDownloadUrl(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.post<DownloadResponse>(
        "/download-requests",
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          productId: product.id,
        },
      );
      reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        productId: product.id,
        website: "",
      });
      setSuccessMessage(response.data.message);
      setDownloadUrl(response.data.downloadUrl);
    } catch (error) {
      const message = axios.isAxiosError<ApiError>(error)
        ? error.response?.data.error ??
          (error.request
            ? "We could not reach the server. Please try again."
            : "Unable to prepare the sample.")
        : "Unable to prepare the sample. Please try again.";
      setErrorMessage(message);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-2 rounded-full bg-[#087f75] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#05645d]"
      >
        Download sample <ArrowDownToLine size={14} />
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        aria-labelledby={`sample-title-${product.id}`}
        className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#087f75]">
              Complimentary sample
            </p>
            <h2
              id={`sample-title-${product.id}`}
              className="mt-2 text-xl font-semibold tracking-tight"
            >
              {product.name}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Share your details to prepare a short-lived sample link.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close sample request"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submitRequest)}
          onChange={() => {
            setDownloadUrl(null);
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          noValidate
          className="p-5 sm:p-6"
        >
          <div
            className="absolute -left-[10000px] size-px overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor={`sample-website-${product.id}`}>Website</label>
            <input
              id={`sample-website-${product.id}`}
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </div>
          <input type="hidden" {...register("productId")} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`sample-name-${product.id}`}
                className="text-xs font-semibold text-slate-700"
              >
                Full name *
              </label>
              <input
                id={`sample-name-${product.id}`}
                autoComplete="name"
                placeholder="Your name"
                className={fieldClassName}
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  Enter your full name.
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor={`sample-company-${product.id}`}
                className="text-xs font-semibold text-slate-700"
              >
                Company
              </label>
              <input
                id={`sample-company-${product.id}`}
                autoComplete="organization"
                placeholder="Company name"
                className={fieldClassName}
                {...register("company")}
              />
            </div>
            <div>
              <label
                htmlFor={`sample-email-${product.id}`}
                className="text-xs font-semibold text-slate-700"
              >
                Email *
              </label>
              <input
                id={`sample-email-${product.id}`}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={fieldClassName}
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  Enter a valid email address.
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor={`sample-phone-${product.id}`}
                className="text-xs font-semibold text-slate-700"
              >
                Phone *
              </label>
              <input
                id={`sample-phone-${product.id}`}
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                className={fieldClassName}
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone && (
                <p role="alert" className="mt-1 text-xs text-rose-700">
                  Enter a valid phone number.
                </p>
              )}
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-800">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              {successMessage}
              {downloadUrl && (
                <>
                  {" "}
                  <a
                    href={downloadUrl}
                    className="font-semibold underline underline-offset-2"
                  >
                    Download the sample
                  </a>{" "}
                  within five minutes.
                </>
              )}
            </p>
          )}

          {!successMessage && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#087f75] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#05645d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  Preparing request <LoaderCircle size={15} className="animate-spin" />
                </>
              ) : (
                "Request sample"
              )}
            </button>
          )}
          <p className="mt-3 text-[10px] leading-5 text-slate-500">
            Your details are used to record this sample request. The download
            link expires after five minutes.
          </p>
        </form>
      </dialog>
    </>
  );
}
