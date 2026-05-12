"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

// Lightweight cookie notice. We only use essential auth cookies — no analytics,
// no ad networks — so the banner doesn't need granular consent UI. It exists
// solely to (a) tell users we're using one essential cookie, (b) link to the
// privacy policy, and (c) record acknowledgement so it stops bugging them.

const STORAGE_KEY = "slipgen.cookie_ack.v1";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Defer to next tick so SSR/CSR don't disagree on initial render.
    try {
      const ack = window.localStorage.getItem(STORAGE_KEY);
      if (!ack) setVisible(true);
    } catch {
      // Private browsing / disabled storage — show once per session.
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try { window.localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-[60] glass-card"
      style={{
        bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        padding: "1rem 1rem 1rem 1.25rem",
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(245, 158, 11, 0.12)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <Cookie className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            We use one essential cookie
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
            It keeps you signed in. We don&apos;t use tracking, analytics, or advertising cookies. See our{" "}
            <Link href="/privacy" className="underline" style={{ color: "var(--primary-light)" }}>
              Privacy Policy
            </Link>
            .
          </p>
          <button
            onClick={dismiss}
            className="btn-primary text-xs px-4 py-2"
            style={{ borderRadius: 8 }}
          >
            Got it
          </button>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss cookie notice"
          className="flex items-center justify-center rounded transition-colors hover:bg-white/10"
          style={{ width: 28, height: 28, color: "var(--text-muted)", flexShrink: 0 }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
