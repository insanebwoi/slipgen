import { requireUser } from "@/lib/supabase/auth";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  // requireUser handles login + ban redirects. Source of truth for plan = profiles row.
  const profile = await requireUser();
  return <EditorClient serverPlan={profile.plan} />;
}
