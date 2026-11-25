import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
