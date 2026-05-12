"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

// Lightweight toast system. No deps. Mount <ToastProvider> once near the root,
// then call useToast().show({ type, message }) from any client component.

type ToastType = "success" | "error" | "info";
interface Toast { id: number; type: ToastType; message: string }

interface ToastContextValue {
  show: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((curr) => [...curr, { ...t, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed z-[80] flex flex-col gap-2 pointer-events-none"
        style={{
          bottom: "calc(1rem + env(safe-area-inset-bottom))",
          right: "1rem",
          left: "1rem",
          maxWidth: 400,
          marginLeft: "auto",
        }}
      >
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const palette = {
    success: { color: "var(--success)", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", icon: <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> },
    error:   { color: "var(--error)",   bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)",  icon: <AlertCircle className="w-4 h-4" aria-hidden="true" /> },
    info:    { color: "var(--primary-light)", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", icon: <Info className="w-4 h-4" aria-hidden="true" /> },
  }[toast.type];

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className="glass-card pointer-events-auto flex items-start gap-3 p-3 animate-fade-in-up"
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: "var(--text-primary)" }}
    >
      <span style={{ color: palette.color, flexShrink: 0, marginTop: 1 }}>{palette.icon}</span>
      <p className="text-sm flex-1" style={{ color: "var(--text-primary)", lineHeight: 1.5 }}>{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="flex items-center justify-center rounded transition-colors hover:bg-white/10"
        style={{ width: 24, height: 24, color: "var(--text-muted)", flexShrink: 0 }}
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
