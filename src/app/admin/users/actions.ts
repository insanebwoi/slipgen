"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import type { UserPlan } from "@/types";
import type { UserRole } from "@/lib/supabase/types";

const VALID_PLANS: UserPlan[] = ["free", "basic", "standard"];
const VALID_ROLES: UserRole[] = ["user", "admin"];

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

export async function updateUserPlanAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const targetId = String(formData.get("user_id") || "");
  const plan = String(formData.get("plan") || "") as UserPlan;
  if (!targetId || !VALID_PLANS.includes(plan)) return;

  const supabase = await getSupabaseServerClient();
  const { data: before } = await supabase.from("profiles").select("plan").eq("id", targetId).single();
  const { error } = await supabase.from("profiles").update({ plan }).eq("id", targetId);
  if (error) return;

  await logAudit(admin.id, targetId, "plan_change", before, { plan });
  revalidatePath("/admin/users");
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const targetId = String(formData.get("user_id") || "");
  const role = String(formData.get("role") || "") as UserRole;
  if (!targetId || !VALID_ROLES.includes(role)) return;
  if (targetId === admin.id && role !== "admin") return; // Prevent self-demotion

  const supabase = await getSupabaseServerClient();
  const { data: before } = await supabase.from("profiles").select("role").eq("id", targetId).single();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", targetId);
  if (error) return;

  await logAudit(admin.id, targetId, "role_change", before, { role });
  revalidatePath("/admin/users");
}

export async function setUserBannedAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const targetId = String(formData.get("user_id") || "");
  const banned = formData.get("banned") === "true";
  if (!targetId) return;
  if (targetId === admin.id) return; // Prevent self-ban

  const supabase = await getSupabaseServerClient();
  const { data: before } = await supabase.from("profiles").select("banned").eq("id", targetId).single();
  const { error } = await supabase.from("profiles").update({ banned }).eq("id", targetId);
  if (error) return;

  await logAudit(admin.id, targetId, banned ? "ban" : "unban", before, { banned });
  revalidatePath("/admin/users");
}
