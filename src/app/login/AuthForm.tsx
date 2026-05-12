"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, signUpAction, signInWithGoogleAction } from "./actions";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [googlePending, startGoogle] = useTransition();
  const searchParams = useSearchParams();

  // If the user lands here via /auth/callback?error=… show it.
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setTimeout(() => setError(decodeURIComponent(err)), 0);
    }
  }, [searchParams]);

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = mode === "login" ? await signInAction(formData) : await signUpAction(formData);
      if (result?.error) setError(result.error);
      if (result && "message" in result && result.message) setMessage(result.message);
    });
  }

  function onGoogleSignIn() {
    setError(null);
    setMessage(null);
    startGoogle(async () => {
      const result = await signInWithGoogleAction();
      // The action calls redirect() on success, so we only get a result here on error.
      if (result?.error) setError(result.error);
    });
  }

  const disabled = pending || googlePending;

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

        {/* Google sign-in — placed above the form because OAuth is the friction-free path */}
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={disabled}
          className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "#ffffff",
            color: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          {/* Inline Google "G" mark — official 4-color SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
          </svg>
          {googlePending ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <form action={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Full name</span>
              <input name="full_name" type="text" className="input-field" placeholder="Jane Teacher" autoComplete="name" />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Email</span>
            <input name="email" type="email" required autoComplete="email" className="input-field" placeholder="you@school.edu" />
          </label>
          <label className="block">
            <span className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Password</span>
            <input
              name="password" type="password" required minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="input-field"
              placeholder={mode === "signup" ? "At least 8 characters" : ""}
            />
          </label>

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

          <button type="submit" disabled={disabled} className="btn-primary w-full py-3 disabled:opacity-50">
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
