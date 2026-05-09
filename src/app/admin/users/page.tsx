import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import type { AdminUserStats } from "@/lib/supabase/types";
import { PlanForm, UserRoleCell, BanForm } from "./RowForms";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("admin_user_stats")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <p className="text-sm" style={{ color: "var(--error)" }}>Failed to load users: {error.message}</p>;
  }

  const users = (data ?? []) as AdminUserStats[];
  const isSuperAdmin = me.role === "super_admin";

  return (
    <div className="max-w-6xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Users</h1>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{users.length} shown · most recent first</p>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Plan</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Slips</th>
              <th className="text-left p-3 font-medium">AI runs</th>
              <th className="text-left p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3 align-top">
                  <div className="font-medium">{u.full_name || u.email.split("@")[0]}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</div>
                </td>
                <td className="p-3 align-top">
                  <PlanForm userId={u.id} currentPlan={u.plan} />
                </td>
                <td className="p-3 align-top">
                  <UserRoleCell user={u} canEdit={isSuperAdmin && u.role !== "super_admin"} />
                </td>
                <td className="p-3 align-top">{u.total_slips_exported.toLocaleString()}</td>
                <td className="p-3 align-top">{u.total_ai_runs.toLocaleString()}</td>
                <td className="p-3 align-top">
                  {u.banned ? (
                    <BanForm userId={u.id} banned={false} label="Suspended · unban" danger />
                  ) : u.id === me.id ? (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>you</span>
                  ) : u.role === "super_admin" ? (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>protected</span>
                  ) : (
                    <BanForm userId={u.id} banned={true} label="ban" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
        Plan changes apply immediately. After confirming a WhatsApp payment, set the user&apos;s plan to <code>basic</code> or <code>standard</code> here.
        {!isSuperAdmin && <span> Role changes are restricted to super-admins.</span>}
      </p>
    </div>
  );
}
