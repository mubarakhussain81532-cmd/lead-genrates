"use client";

import {
  Building2,
  Database,
  Factory,
  GraduationCap,
  HeartPulse,
  Hotel,
  Network,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DownloadSampleDialog from "@/components/download-sample-dialog";
import { apiClient } from "@/lib/axios";
import type { PublicProduct } from "@/types/api";

const productIcons = {
  Leadership: Building2,
  "Business directory": Network,
  "Audience research": Sparkles,
  Education: GraduationCap,
  Healthcare: HeartPulse,
  Hospitality: Hotel,
  Industrial: Factory,
} as const;

export default function ProductCatalog() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    apiClient
      .get<{ items: PublicProduct[] }>("/products")
      .then(({ data }) => {
        if (active) {
          setProducts(data.items);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setHasError(true);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-[330px] animate-pulse rounded-2xl bg-slate-200/70"
          />
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <p role="alert" className="mt-10 rounded-2xl bg-rose-50 p-6 text-sm text-rose-800">
        The database catalogue is temporarily unavailable. Please try again or
        contact our team.
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <Database className="mx-auto text-[#087f75]" size={28} />
        <p className="mt-4 text-base font-semibold text-slate-900">
          The catalogue is being prepared.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Contact us with your audience and location requirements while the
          product catalogue is being set up.
        </p>
        <Link
          href="/contact#inquiry"
          className="mt-5 inline-flex rounded-full bg-[#087f75] px-5 py-2.5 text-xs font-semibold text-white"
        >
          Contact the team
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const Icon =
          Object.entries(productIcons).find(
            ([category]) => category === product.category,
          )?.[1] ?? Database;

        return (
          <article
            key={product.id}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-[#9dd5c9] hover:shadow-[0_20px_50px_-30px_rgba(10,29,43,0.28)]"
          >
            <div className="relative h-40 overflow-hidden bg-[#eef7f4]">
              <Image
                src={product.image}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1d2b]/30 to-transparent" />
              <span className="absolute bottom-4 left-4 grid size-10 place-items-center rounded-xl bg-white text-[#087f75] shadow-sm">
                <Icon size={20} />
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#087f75]">
                {product.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                {product.name}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {product.description}
              </p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                {product.sampleAvailable ? (
                  <DownloadSampleDialog product={product} />
                ) : (
                  <Link
                    href="/contact#inquiry"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#087f75]"
                  >
                    Request details
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
