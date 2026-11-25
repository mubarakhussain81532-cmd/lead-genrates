import type { Metadata } from "next";
import LoginForm from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top_right,_rgba(140,226,206,0.2),_transparent_40%),#f5f7fb] px-5 py-12">
      <LoginForm />
    </main>
  );
}
