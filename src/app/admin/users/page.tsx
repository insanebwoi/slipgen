import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import type { AdminUserStats } from "@/lib/supabase/types";
import { updateUserPlanAction, updateUserRoleAction, setUserBannedAction } from "./actions";

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
                <td className="p-3">
                  <div className="font-medium">{u.full_name || u.email.split("@")[0]}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</div>
                </td>
                <td className="p-3">
                  <form action={updateUserPlanAction} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={u.id} />
                    <select name="plan" defaultValue={u.plan} className="text-xs rounded-md px-2 py-1 border" style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}>
                      <option value="free">free</option>
                      <option value="basic">basic</option>
                      <option value="standard">standard</option>
                    </select>
                    <button type="submit" className="text-xs underline" style={{ color: "var(--primary)" }}>save</button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={updateUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={u.id} />
                    <select name="role" defaultValue={u.role} disabled={u.id === me.id} className="text-xs rounded-md px-2 py-1 border" style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    {u.id !== me.id && <button type="submit" className="text-xs underline" style={{ color: "var(--primary)" }}>save</button>}
                  </form>
                </td>
                <td className="p-3">{u.total_slips_exported.toLocaleString()}</td>
                <td className="p-3">{u.total_ai_runs.toLocaleString()}</td>
                <td className="p-3">
                  {u.banned ? (
                    <form action={setUserBannedAction}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <input type="hidden" name="banned" value="false" />
                      <button type="submit" className="text-xs px-2 py-1 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "var(--error)" }}>Suspended · unban</button>
                    </form>
                  ) : u.id === me.id ? (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>you</span>
                  ) : (
                    <form action={setUserBannedAction}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <input type="hidden" name="banned" value="true" />
                      <button type="submit" className="text-xs underline" style={{ color: "var(--text-muted)" }}>ban</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
        Plan changes apply immediately. After confirming a WhatsApp payment, set the user&apos;s plan to <code>basic</code> or <code>standard</code> here.
      </p>
    </div>
  );
}
