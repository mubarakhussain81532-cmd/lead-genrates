"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, BarChart3, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/axios";
import { adminLoginSchema } from "@/utils/admin-schemas";
import type { z } from "zod";

type LoginValues = z.input<typeof adminLoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError("");
    try {
      await apiClient.post("/admin/login", values);
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      const message =
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
          ? error.response.data.error
          : "Unable to sign in. Please try again.";
      setServerError(message);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="mb-10 inline-flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-[#0a1d2b] text-[#81dfc7]">
          <BarChart3 size={21} />
        </span>
        <span className="text-sm font-bold tracking-tight text-slate-950">
          eCore <span className="text-[#087f75]">Business</span>
        </span>
      </Link>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_90px_-50px_rgba(10,29,43,0.3)] sm:p-9">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf5f2] text-[#087f75]">
          <LockKeyhole size={21} />
        </span>
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#087f75]">
          Admin portal
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in to manage enquiries, products, downloads, and website content.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-xs font-semibold text-slate-700">
              Work email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              {...register("email")}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#087f75] focus:ring-4 focus:ring-[#087f75]/10"
              placeholder="you@company.com"
            />
            {errors.email && <p className="mt-1.5 text-xs text-rose-700">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold text-slate-700">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#087f75] focus:ring-4 focus:ring-[#087f75]/10"
              placeholder="Enter your password"
            />
            {errors.password && <p className="mt-1.5 text-xs text-rose-700">{errors.password.message}</p>}
          </div>
          {serverError && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {serverError}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087f75] px-5 text-sm font-semibold text-white transition hover:bg-[#05645d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in to dashboard"}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>
        <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
          Admin accounts are provisioned by an authorized operator. Contact your system administrator if you need access.
        </p>
      </div>
    </div>
  );
}
