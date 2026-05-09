"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/supabase/auth";
import type { UserPlan } from "@/types";
import type { UserRole } from "@/lib/supabase/types";

const VALID_PLANS: UserPlan[] = ["free", "basic", "standard"];
const VALID_ROLES: UserRole[] = ["user", "admin", "super_admin"];

export type ActionResult = { ok: boolean; error?: string };

async function logAudit(actorId: string, targetId: string, action: string, before: unknown, after: unknown): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.from("audit_log").insert({
    actor_id: actorId,
    target_id: targetId,
    action,
    before_value: before,
    after_value: after,
  });
}

export async function updateUserPlanAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const targetId = String(formData.get("user_id") || "");
  const plan = String(formData.get("plan") || "") as UserPlan;
  if (!targetId) return { ok: false, error: "Missing user_id" };
  if (!VALID_PLANS.includes(plan)) return { ok: false, error: "Invalid plan" };

  const supabase = await getSupabaseServerClient();
  const { data: before } = await supabase.from("profiles").select("plan").eq("id", targetId).single();
  const { error } = await supabase.from("profiles").update({ plan }).eq("id", targetId);
  if (error) return { ok: false, error: error.message };

  await logAudit(admin.id, targetId, "plan_change", before, { plan });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUserRoleAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  // Only super-admins can grant or revoke roles. Regular admins can manage plans
  // and bans but cannot change the admin pool.
  const admin = await requireSuperAdmin();
  const targetId = String(formData.get("user_id") || "");
  const role = String(formData.get("role") || "") as UserRole;
  if (!targetId) return { ok: false, error: "Missing user_id" };
  if (!VALID_ROLES.includes(role)) return { ok: false, error: "Invalid role" };
  if (targetId === admin.id && role !== "super_admin") {
    return { ok: false, error: "You cannot demote yourself." };
  }

  const supabase = await getSupabaseServerClient();
  const { data: before } = await supabase.from("profiles").select("role").eq("id", targetId).single();
  // A super-admin cannot be demoted via this action — protects the root account.
  if (before?.role === "super_admin" && role !== "super_admin") {
    return { ok: false, error: "Super-admin role cannot be revoked here." };
  }
  const { error } = await supabase.from("profiles").update({ role }).eq("id", targetId);
  if (error) return { ok: false, error: error.message };

  await logAudit(admin.id, targetId, "role_change", before, { role });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserBannedAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const targetId = String(formData.get("user_id") || "");
  const banned = formData.get("banned") === "true";
  if (!targetId) return { ok: false, error: "Missing user_id" };
  if (targetId === admin.id) return { ok: false, error: "You cannot ban yourself." };

  const supabase = await getSupabaseServerClient();
  const { data: before } = await supabase.from("profiles").select("banned, role").eq("id", targetId).single();
  // Super-admins are unbannable — guards the root account from being locked out by another admin.
  if (before?.role === "super_admin") {
    return { ok: false, error: "Super-admin accounts cannot be banned." };
  }
  const { error } = await supabase.from("profiles").update({ banned }).eq("id", targetId);
  if (error) return { ok: false, error: error.message };

  await logAudit(admin.id, targetId, banned ? "ban" : "unban", before, { banned });
  revalidatePath("/admin/users");
  return { ok: true };
}
