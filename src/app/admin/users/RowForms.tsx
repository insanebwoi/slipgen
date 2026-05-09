"use client";

import { useActionState } from "react";
import { updateUserPlanAction, updateUserRoleAction, setUserBannedAction, type ActionResult } from "./actions";
import type { AdminUserStats } from "@/lib/supabase/types";

const initial: ActionResult = { ok: true };

export function PlanForm({ userId, currentPlan }: { userId: string; currentPlan: string }) {
  const [state, formAction, pending] = useActionState(updateUserPlanAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input type="hidden" name="user_id" value={userId} />
        <select name="plan" defaultValue={currentPlan} className="text-xs rounded-md px-2 py-1 border" style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}>
          <option value="free">free</option>
          <option value="basic">basic</option>
          <option value="standard">standard</option>
        </select>
        <button type="submit" disabled={pending} className="text-xs underline disabled:opacity-50" style={{ color: "var(--primary)" }}>
          {pending ? "saving…" : "save"}
        </button>
      </div>
      {state?.error && <span className="text-[10px]" style={{ color: "var(--error)" }}>{state.error}</span>}
    </form>
  );
}

export function RoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [state, formAction, pending] = useActionState(updateUserRoleAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input type="hidden" name="user_id" value={userId} />
        <select name="role" defaultValue={currentRole} className="text-xs rounded-md px-2 py-1 border" style={{ background: "var(--surface-elevated)", borderColor: "var(--border)" }}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit" disabled={pending} className="text-xs underline disabled:opacity-50" style={{ color: "var(--primary)" }}>
          {pending ? "saving…" : "save"}
        </button>
      </div>
      {state?.error && <span className="text-[10px]" style={{ color: "var(--error)" }}>{state.error}</span>}
    </form>
  );
}

export function BanForm({ userId, banned, label, danger }: { userId: string; banned: boolean; label: string; danger?: boolean }) {
  const [state, formAction, pending] = useActionState(setUserBannedAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="banned" value={banned ? "true" : "false"} />
      <button
        type="submit"
        disabled={pending}
        className={danger ? "text-xs px-2 py-1 rounded disabled:opacity-50" : "text-xs underline disabled:opacity-50"}
        style={danger
          ? { background: "rgba(239,68,68,0.1)", color: "var(--error)" }
          : { color: "var(--text-muted)" }}
      >
        {pending ? "…" : label}
      </button>
      {state?.error && <span className="text-[10px]" style={{ color: "var(--error)" }}>{state.error}</span>}
    </form>
  );
}

export function UserRoleCell({ user, canEdit }: { user: AdminUserStats; canEdit: boolean }) {
  if (canEdit) return <RoleForm userId={user.id} currentRole={user.role} />;
  return (
    <span className="text-xs" style={{ color: user.role === "super_admin" ? "var(--primary-light)" : "var(--text-muted)" }}>
      {user.role === "super_admin" ? "super admin" : user.role}
    </span>
  );
}
