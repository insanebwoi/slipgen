"use client";

import { useState, useEffect } from "react";
import { useSlipGenStore } from "@/lib/store";
import StepIndicator from "@/components/editor/StepIndicator";
import StudentForm from "@/components/editor/StudentForm";
import AIProcessor from "@/components/editor/AIProcessor";
import TemplateSelector from "@/components/editor/TemplateSelector";
import LayoutEngine from "@/components/editor/LayoutEngine";
import ExportPanel from "@/components/editor/ExportPanel";
import SlipPreview from "@/components/editor/SlipPreview";
import WelcomeModal from "@/components/editor/WelcomeModal";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Maximize2, X } from "lucide-react";
import type { UserPlan } from "@/types";
import UserMenu from "@/components/UserMenu";

const PLAN_OPTIONS: UserPlan[] = ['free', 'basic', 'standard'];
// Dev-only plan switcher in the header. Set NEXT_PUBLIC_DEV_PLAN_SWITCHER=1 to show it.
// Hidden in production regardless of env var to prevent accidental exposure.
const SHOW_DEV_PLAN_SWITCHER =
  process.env.NEXT_PUBLIC_DEV_PLAN_SWITCHER === '1' && process.env.NODE_ENV !== 'production';

export default function EditorClient({ serverPlan }: { serverPlan: UserPlan }) {
  const { currentStep, userPlan, setUserPlan } = useSlipGenStore();
  const [fullscreen, setFullscreen] = useState(false);

  // The server is the source of truth for plan; sync the store on mount and
  // whenever the prop changes (e.g. after a plan upgrade).
  useEffect(() => {
    setUserPlan(serverPlan);
  }, [serverPlan, setUserPlan]);

  // Esc closes the fullscreen preview — standard modal expectation.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const renderStep = () => {
    switch (currentStep) {
      case "students": return <StudentForm />;
      case "ai-process": return <AIProcessor />;
      case "template": return <TemplateSelector />;
      case "layout": return <LayoutEngine />;
      case "export": return <ExportPanel />;
      default: return <StudentForm />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="mesh-gradient" />

      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm hover:text-white transition-colors" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-5" style={{ background: "var(--border)" }}></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Image src="/brand/logo-white.svg" alt="SlipGen" width={18} height={18} priority />
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              SlipGen <span style={{ color: "var(--text-muted)" }}>Editor</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StepIndicator />
          {SHOW_DEV_PLAN_SWITCHER && (
            <div className="hidden md:flex items-center gap-1.5 pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Dev plan</span>
              <select
                value={userPlan}
                onChange={(e) => setUserPlan(e.target.value as UserPlan)}
                className="text-xs rounded-md px-2 py-1 border"
                style={{ background: "var(--surface-elevated)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {PLAN_OPTIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
          )}
          <div className="pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row">
        {/* Mobile preview: shown at top on small screens */}
        <div className="lg:hidden w-full overflow-auto relative" style={{ background: "var(--surface)", maxHeight: "40vh", borderBottom: "1px solid var(--border)" }}>
          <div className="p-4">
            <SlipPreview />
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 p-2 rounded-lg transition-all hover:scale-105"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            aria-label="Open fullscreen preview"
            title="Fullscreen preview"
          >
            <Maximize2 className="w-4 h-4 text-white" aria-hidden="true" />
          </button>
        </div>

        {/* Controls panel */}
        <main id="main-content" className="w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 overflow-y-auto p-5" style={{ borderRight: "1px solid var(--border)", maxHeight: "calc(100vh - 57px)" }}>
          <div className="animate-fade-in">{renderStep()}</div>
        </main>

        {/* Desktop preview: side panel on large screens */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8 overflow-auto relative" style={{ background: "var(--surface)", maxHeight: "calc(100vh - 57px)" }}>
          <SlipPreview />
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute top-4 right-4 p-2.5 rounded-xl transition-all hover:scale-105"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
            aria-label="Open fullscreen preview"
            title="Fullscreen preview"
          >
            <Maximize2 className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fullscreen-title"
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "var(--bg)" }}
        >
          {/* Fullscreen header */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <Image src="/brand/logo-color.svg" alt="" width={20} height={20} aria-hidden="true" />
              <span id="fullscreen-title" className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                Preview <span style={{ color: "var(--text-muted)" }}>— Fullscreen</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Close fullscreen preview"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Close
            </button>
          </div>
          {/* Fullscreen preview area */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-6" style={{ background: "var(--surface)" }}>
            <SlipPreview />
          </div>
        </div>
      )}

      {/* First-run welcome — shown only when the workspace is empty and the
          user hasn't dismissed it before. */}
      <WelcomeModal />
    </div>
  );
}
