"use client";

import { useSlipGenStore } from "@/lib/store";
import { EditorStep } from "@/types";
import { Users, Sparkles, Palette, Layout, FileDown, Check } from "lucide-react";

const steps: { key: EditorStep; label: string; icon: React.ReactNode }[] = [
  { key: "students", label: "Students", icon: <Users className="w-3.5 h-3.5" /> },
  { key: "template", label: "Template", icon: <Palette className="w-3.5 h-3.5" /> },
  { key: "layout", label: "Layout", icon: <Layout className="w-3.5 h-3.5" /> },
  { key: "export", label: "Export", icon: <FileDown className="w-3.5 h-3.5" /> },
];

const stepOrder: EditorStep[] = ["students", "template", "layout", "export"];

export default function StepIndicator() {
  const { currentStep, setStep, students, selectedTemplate } = useSlipGenStore();
  const currentIndex = stepOrder.indexOf(currentStep);

  const isStepAccessible = (step: EditorStep) => {
    const idx = stepOrder.indexOf(step);
    if (idx === 0) return true;
    if (idx === 1) return students.length > 0; // template
    if (idx === 2) return students.length > 0 && selectedTemplate !== null;
    if (idx === 3) return students.length > 0 && selectedTemplate !== null;
    return false;
  };

  const isCompleted = (step: EditorStep) => {
    return stepOrder.indexOf(step) < currentIndex;
  };

  return (
    <div className="hidden md:flex items-center gap-1">
      {steps.map((step, i) => {
        const accessible = isStepAccessible(step.key);
        const completed = isCompleted(step.key);
        const active = step.key === currentStep;

        return (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => accessible && setStep(step.key)}
              disabled={!accessible}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active ? "text-white"
                  : completed ? "text-[var(--success)]"
                  : accessible ? "text-[var(--text-secondary)] hover:text-white"
                  : "text-[var(--text-muted)] opacity-50 cursor-not-allowed"
              }`}
              style={
                active ? { background: "var(--gradient-primary)" }
                  : completed ? { background: "rgba(16, 185, 129, 0.1)" }
                  : {}
              }
            >
              {completed ? <Check className="w-3.5 h-3.5" /> : step.icon}
              {step.label}
            </button>
            {i < steps.length - 1 && (
              <div className="w-6 h-px mx-1" style={{ background: i < currentIndex ? "var(--success)" : "var(--border)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
