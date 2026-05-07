"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/editor");
}

export async function signUpAction(formData: FormData): Promise<{ error?: string; message?: string }> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || email.split("@")[0] } },
  });
  if (error) return { error: error.message };

  // If email confirmation is OFF in Supabase, the user is signed in immediately and we can redirect.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/editor");
  }
  return { message: "Check your email to confirm your account, then log in." };
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
