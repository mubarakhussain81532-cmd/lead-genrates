import { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import { getCurrentAdmin } from "@/lib/admin-session";

async function AdminContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return <AdminShell admin={admin}>{children}</AdminShell>;
}

export default function ProtectedAdminLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-sm text-slate-500">
          Loading secure workspace…
        </div>
      }
    >
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}
