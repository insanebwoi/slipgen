"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signInAction, signUpAction } from "./actions";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = mode === "login" ? await signInAction(formData) : await signUpAction(formData);
      if (result?.error) setError(result.error);
      if (result && "message" in result && result.message) setMessage(result.message);
    });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="mesh-gradient" />
      <div className="relative z-10 w-full max-w-md glass-card p-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {mode === "login" ? "Sign in to continue to SlipGen." : "Free plan, no credit card required."}
        </p>

        <form action={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Full name</label>
              <input name="full_name" type="text" className="input-field" placeholder="Jane Teacher" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Email</label>
            <input name="email" type="email" required autoComplete="email" className="input-field" placeholder="you@school.edu" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Password</label>
            <input
              name="password" type="password" required minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="input-field"
              placeholder={mode === "signup" ? "At least 8 characters" : ""}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "var(--error)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(16,185,129,0.08)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.2)" }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full py-3 disabled:opacity-50">
            {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-xs mt-6 text-center" style={{ color: "var(--text-muted)" }}>
          {mode === "login" ? (
            <>Don&apos;t have an account? <Link href="/signup" className="underline" style={{ color: "var(--primary)" }}>Sign up</Link></>
          ) : (
            <>Already have an account? <Link href="/login" className="underline" style={{ color: "var(--primary)" }}>Sign in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
