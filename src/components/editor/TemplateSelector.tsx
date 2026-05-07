"use client";

import { useSlipGenStore } from "@/lib/store";
import { templates } from "@/lib/templates";
import { Template } from "@/types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function TemplateSelector() {
  const { selectedTemplate, setSelectedTemplate, setStep } = useSlipGenStore();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Choose Template</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Select a design style for your name slips</p>
      </div>
      <div className="space-y-3 mb-6">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} isSelected={selectedTemplate?.id === t.id} onSelect={() => setSelectedTemplate(t)} />
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep("ai-process")} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => { if (selectedTemplate) setStep("layout"); }} disabled={!selectedTemplate} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
          Layout Engine <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const descriptions: Record<string, string> = {
  "plain-pastel": "Solid soft colors • Ultra-clean • Minimal",
  "line-pattern": "Diagonal stripes • Blue tones • Structured",
  "cartoon-fun": "Passion-themed background • Fun & playful",
  "wavy-pattern": "Organic waves • Pink tones • Modern",
  "classic-traditional": "Double border • Serif font • Formal school",
};

function TemplateCard({ template, isSelected, onSelect }: { template: Template; isSelected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={`w-full text-left rounded-xl p-4 transition-all border-2 ${isSelected ? "border-[var(--primary)] shadow-[0_0_20px_rgba(99,102,241,0.2)]" : "border-transparent hover:border-[var(--border-hover)]"}`} style={{ background: isSelected ? "rgba(99, 102, 241, 0.05)" : "var(--surface-elevated)" }}>
      <div className="flex items-center gap-3">
        <MiniPreview template={template} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate">{template.name}</h3>
            {isSelected && <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--primary)", color: "white" }}><Check className="w-3 h-3" /></span>}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{descriptions[template.id] || ""}</p>
          <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{template.width}×{template.height}mm</p>
        </div>
      </div>
    </button>
  );
}

function MiniPreview({ template }: { template: Template }) {
  const W = 110, H = Math.round(110 * (template.height / template.width));
  return (
    <div className="rounded-lg flex-shrink-0 overflow-hidden relative" style={{ width: W, height: H, border: "1px solid var(--border)" }}>
      {template.id === "plain-pastel" && <ThumbPlain />}
      {template.id === "line-pattern" && <ThumbLine />}
      {template.id === "cartoon-fun" && <ThumbCartoon />}
      {template.id === "wavy-pattern" && <ThumbWavy />}
      {template.id === "classic-traditional" && <ThumbClassic />}
      {template.id === "plain-classic-noimage" && <ThumbPlainClassicNoImage />}
    </div>
  );
}

function WM() {
  return <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center" style={{ height: 8 }}><span style={{ fontSize: 4.5, fontWeight: 800, letterSpacing: 1, color: "rgba(0,0,0,0.15)" }}>SLIPGEN</span></div>;
}

function ThumbPlain() {
  return (
    <div className="absolute inset-0" style={{ background: "#e0e7ff" }}>
      <div className="absolute inset-0 flex p-1 gap-1">
        <div className="rounded" style={{ width: "34%", background: "rgba(255,255,255,0.5)" }} />
        <div className="flex-1 rounded flex flex-col gap-[2px] p-1 justify-between" style={{ background: "white" }}>
          <div style={{ height: 5, width: "78%", background: "#3730a3", borderRadius: 1 }} />
          <div style={{ height: 0.5, width: "88%", background: "#c7d2fe" }} />
          <div className="flex gap-[2px]">{[1,2].map(i=><div key={i} style={{ flex: 1, height: 0.5, background: "#c7d2fe" }} />)}</div>
          <div style={{ height: 3, width: "55%", background: "#4f46e5", borderRadius: 1 }} />
        </div>
      </div>
      <WM />
    </div>
  );
}

function ThumbLine() {
  return (
    <div className="absolute inset-0" style={{ background: "#e0f2fe" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(14,165,233,0.12) 4px, rgba(14,165,233,0.12) 8px)" }} />
      <div className="absolute inset-0 flex p-1 gap-1">
        <div className="rounded" style={{ width: "34%", background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(14,165,233,0.3)" }} />
        <div className="flex-1 rounded flex flex-col gap-[2px] p-1 justify-between" style={{ background: "rgba(255,255,255,0.92)", border: "0.5px solid rgba(14,165,233,0.15)" }}>
          <div style={{ height: 5, width: "78%", background: "#0c4a6e", borderRadius: 1 }} />
          <div style={{ height: 0.5, width: "88%", background: "#bae6fd" }} />
          <div className="flex gap-[2px]">{[1,2].map(i=><div key={i} style={{ flex: 1, height: 0.5, background: "#bae6fd" }} />)}</div>
          <div style={{ height: 3, width: "55%", background: "#0284c7", borderRadius: 1 }} />
        </div>
      </div>
      <WM />
    </div>
  );
}

function ThumbCartoon() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #c7f5d4, #a7e8bd)" }}>
      <div className="absolute inset-0 flex p-1 gap-1">
        <div className="rounded" style={{ width: "34%", background: "rgba(255,255,255,0.4)", border: "1.5px solid rgba(255,255,255,0.7)" }} />
        <div className="flex-1 rounded flex flex-col gap-[2px] p-1 justify-between" style={{ background: "rgba(255,255,255,0.88)" }}>
          <div style={{ height: 5, width: "78%", background: "#1e293b", borderRadius: 1 }} />
          <div style={{ height: 0.5, width: "88%", background: "#d1d5db" }} />
          <div className="flex gap-[2px]">{[1,2].map(i=><div key={i} style={{ flex: 1, height: 0.5, background: "#d1d5db" }} />)}</div>
          <div style={{ height: 3, width: "55%", background: "#059669", borderRadius: 1 }} />
        </div>
      </div>
      {/* Small fun icons */}
      <div className="absolute" style={{ top: 2, right: 3, fontSize: 6 }}>🎨</div>
      <div className="absolute" style={{ bottom: 10, left: 3, fontSize: 5 }}>⭐</div>
      <WM />
    </div>
  );
}

function ThumbWavy() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #fdf2f8, #fce7f3)" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 110 65" preserveAspectRatio="none">
        <path d="M0,45 C28,35 55,55 110,42 L110,65 L0,65 Z" fill="rgba(244,114,182,0.15)" />
        <path d="M0,52 C33,44 66,58 110,50 L110,65 L0,65 Z" fill="rgba(236,72,153,0.1)" />
        <circle cx="92" cy="12" r="8" fill="rgba(244,114,182,0.12)" />
      </svg>
      <div className="absolute inset-0 flex p-1 gap-1">
        <div className="flex items-center justify-center" style={{ width: "34%" }}>
          <div className="rounded-full" style={{ width: 26, height: 26, background: "rgba(255,255,255,0.5)" }} />
        </div>
        <div className="flex-1 rounded flex flex-col gap-[2px] p-1 justify-between" style={{ background: "rgba(255,255,255,0.88)" }}>
          <div style={{ height: 5, width: "78%", background: "#9d174d", borderRadius: 1 }} />
          <div style={{ height: 0.5, width: "88%", background: "#f9a8d4" }} />
          <div className="flex gap-[2px]">{[1,2].map(i=><div key={i} style={{ flex: 1, height: 0.5, background: "#f9a8d4" }} />)}</div>
          <div style={{ height: 3, width: "55%", background: "#db2777", borderRadius: 1 }} />
        </div>
      </div>
      <WM />
    </div>
  );
}

function ThumbClassic() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fffdf5, #fef9e7)" }}>
      <div className="absolute" style={{ inset: 2, border: "1.5px solid #b8860b", borderRadius: 1 }}>
        <div className="absolute" style={{ inset: 1.5, border: "0.5px solid #daa520" }} />
      </div>
      <div className="absolute inset-0 flex p-[5px] gap-1">
        <div className="rounded" style={{ width: "30%", background: "rgba(184,134,11,0.12)", border: "1px solid #b8860b" }} />
        <div className="flex-1 flex flex-col gap-[2px] p-0.5 justify-between">
          <div style={{ height: 3, width: "70%", background: "#8b6914", borderRadius: 1, alignSelf: "center" }} />
          <div style={{ height: 4, width: "90%", background: "#2d1810", borderRadius: 1 }} />
          {[80, 70].map((w, i) => <div key={i} style={{ height: 0.5, width: `${w}%`, borderBottom: "0.5px dotted #b8860b" }} />)}
          <div className="flex gap-[2px]">{[1,2].map(i=><div key={i} style={{ flex: 1, height: 0.5, borderBottom: "0.5px dotted #b8860b" }} />)}</div>
        </div>
      </div>
      <WM />
    </div>
  );
}

function ThumbPlainClassicNoImage() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #fffdf5, #fef9e7)" }}>
      <div className="absolute" style={{ inset: 2, border: "1px solid #b8860b", borderRadius: 1 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-[5px] gap-1">
        <div style={{ height: 3, width: "50%", background: "#8b6914", borderRadius: 1 }} />
        <div style={{ height: 5, width: "80%", background: "#2d1810", borderRadius: 1 }} />
        <div style={{ height: 0.5, width: "60%", borderBottom: "0.5px dotted #b8860b", margin: "2px 0" }} />
        <div className="flex w-[80%] gap-1">
          <div style={{ flex: 1, height: 0.5, borderBottom: "0.5px dotted #b8860b" }} />
          <div style={{ flex: 1, height: 0.5, borderBottom: "0.5px dotted #b8860b" }} />
        </div>
      </div>
      <WM />
    </div>
  );
}
