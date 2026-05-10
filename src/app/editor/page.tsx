import type { Metadata } from "next";
import { requireUser } from "@/lib/supabase/auth";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

export default async function EditorPage() {
  // requireUser handles login + ban redirects. Source of truth for plan = profiles row.
  const profile = await requireUser();
  return <EditorClient serverPlan={profile.plan} />;
}
