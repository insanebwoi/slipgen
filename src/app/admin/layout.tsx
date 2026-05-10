import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { signOutAction } from "../login/actions";
import { Shield, Users, BarChart3, ArrowLeft } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="mesh-gradient" />

      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm hover:text-white transition-colors" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft className="w-4 h-4" /> Back to site
          </Link>
          <div className="w-px h-5" style={{ background: "var(--border)" }} />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              SlipGen <span style={{ color: "var(--text-muted)" }}>Admin</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: "var(--text-muted)" }}>{profile.email}</span>
          <form action={signOutAction}>
            <button type="submit" className="text-sm hover:text-white" style={{ color: "var(--text-secondary)" }}>Sign out</button>
          </form>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex">
        <aside className="w-56 flex-shrink-0 p-4" style={{ borderRight: "1px solid var(--border)" }}>
          <nav className="space-y-1">
            <NavLink href="/admin" icon={<BarChart3 className="w-4 h-4" />} label="Dashboard" />
            <NavLink href="/admin/users" icon={<Users className="w-4 h-4" />} label="Users" />
          </nav>
        </aside>
        <main className="flex-1 p-6 md:p-10 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[var(--surface-elevated)]" style={{ color: "var(--text-secondary)" }}>
      {icon} {label}
    </Link>
  );
}
