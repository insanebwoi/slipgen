import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Users, Crown, Sparkles, FileDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await getSupabaseServerClient();

  const [{ count: totalUsers }, { count: paidUsers }, { count: bannedUsers }, exportsAgg, aiAgg] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).neq("plan", "free"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("banned", true),
    supabase.from("slip_events").select("slip_count").eq("event_type", "export"),
    supabase.from("slip_events").select("id", { count: "exact", head: true }).eq("event_type", "ai_process"),
  ]);

  const totalSlipsExported = (exportsAgg.data ?? []).reduce((acc, row) => acc + (row.slip_count || 0), 0);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Users className="w-5 h-5" />} label="Total users" value={totalUsers ?? 0} />
        <Stat icon={<Crown className="w-5 h-5" />} label="Paid users" value={paidUsers ?? 0} accent="var(--success)" />
        <Stat icon={<FileDown className="w-5 h-5" />} label="Slips exported" value={totalSlipsExported} />
        <Stat icon={<Sparkles className="w-5 h-5" />} label="AI runs" value={aiAgg.count ?? 0} />
      </div>

      {(bannedUsers ?? 0) > 0 && (
        <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          {bannedUsers} suspended account{bannedUsers === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2" style={{ color: "var(--text-muted)" }}>
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: accent ?? "var(--text-primary)" }}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
