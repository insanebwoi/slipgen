/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSlipGenStore } from "@/lib/store";
import { PAPER_SIZES, Student, Template, WatermarkConfig } from "@/types";
import { getPassionTheme } from "@/lib/templates";
import { User, Printer, ZoomIn, ZoomOut, Maximize } from "lucide-react";

const PREVIEW_SCALE = 3;

export default function SlipPreview() {
  const { students, selectedTemplate, layoutConfig, layoutResult, recalculateLayout, currentStep, watermark } = useSlipGenStore();
  const [zoom, setZoom] = useState(0.5); // Default to 50% so large previews fit better initially
  useEffect(() => { 
    recalculateLayout(); 
  }, [
    selectedTemplate, 
    layoutConfig.paperSize, 
    layoutConfig.margin, 
    layoutConfig.gap,
    recalculateLayout
  ]);

  const paper = selectedTemplate ? PAPER_SIZES[layoutConfig.paperSize] : null;
  const paperW = paper ? paper.width * PREVIEW_SCALE : 0;
  const paperH = paper ? paper.height * PREVIEW_SCALE : 0;
  // Slot dimensions come from the engine so they reflect any landscape-rotation it picked.
  const slipW = layoutResult ? layoutResult.slipWidth * PREVIEW_SCALE : (selectedTemplate ? selectedTemplate.width * PREVIEW_SCALE : 0);
  const slipH = layoutResult ? layoutResult.slipHeight * PREVIEW_SCALE : (selectedTemplate ? selectedTemplate.height * PREVIEW_SCALE : 0);
  const rotated = layoutResult?.rotated ?? false;

  const slotAssignments = useMemo(() => {
    if (!layoutResult || students.length === 0) return [];
    const allSlips: { student: Student; copyIndex: number }[] = [];
    for (const s of students) for (let i = 0; i < layoutConfig.copies; i++) allSlips.push({ student: s, copyIndex: i });
    return layoutResult.positions.slice(0, allSlips.length).map((pos, i) => ({
      student: allSlips[i].student,
      copyIndex: allSlips[i].copyIndex,
      position: pos,
    }));
  }, [students, layoutResult, layoutConfig.copies]);

  const emptyPositions = useMemo(() => layoutResult ? layoutResult.positions.slice(slotAssignments.length) : [], [layoutResult, slotAssignments]);

  if (!selectedTemplate) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-elevated)" }}>
          <Printer className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
        </div>
        <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>Preview</h3>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Your name slips will appear here</p>
      </div>
    );
  }

  if (currentStep === "students" || currentStep === "template") {
    const previewStudent: Student = students[0] || {
      id: "preview", name: "Student Name", className: "5th", division: "A", rollNo: "01", subject: "Mathematics",
      schoolName: "Sample School", passion: "Scientist", gender: "child", imageUrl: null, imageFile: null,
      aiImageUrl: null, aiProcessing: false, aiProcessed: false,
    };
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Name Slip Preview</p>
        <div style={{ transform: "scale(1.5)", transformOrigin: "top center" }}>
          <NameSlip student={previewStudent} template={selectedTemplate} scale={PREVIEW_SCALE} watermark={watermark} copyIndex={0} />
        </div>
        {students.length > 1 && <p className="text-xs mt-20" style={{ color: "var(--text-muted)" }}>Showing first of {students.length} students</p>}
      </div>
    );
  }

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center justify-between w-full max-w-3xl px-4">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Print Layout — {layoutConfig.paperSize}</p>
        
        <div className="flex items-center gap-1.5 bg-[var(--surface)] rounded-lg p-1 border shadow-sm" style={{ borderColor: 'var(--border)' }} role="group" aria-label="Preview zoom">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="text-xs font-medium w-10 text-center" style={{ color: 'var(--text-secondary)' }} aria-live="polite" aria-atomic="true">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} aria-hidden="true"></div>
          <button
            type="button"
            onClick={handleZoomReset}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Reset zoom to 100%"
            title="Reset zoom"
          >
            <Maximize className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="w-full flex justify-center overflow-auto custom-scrollbar pb-8" style={{ maxHeight: '70vh' }}>
        <div style={{ width: paperW * zoom, height: paperH * zoom, transition: 'width 0.2s, height 0.2s' }} className="flex-shrink-0">
          <div 
            id="layout-preview-canvas" 
            className="paper-preview relative shadow-xl bg-white transition-transform duration-200" 
            style={{ 
              width: paperW, 
              height: paperH,
              transform: `scale(${zoom})`,
              transformOrigin: "top left"
            }}
          >
        {slotAssignments.map(({ student, copyIndex, position }, i) => {
          // Slot is sized to the engine's chosen orientation (slipW/slipH).
          // The slip itself always renders at template.width × template.height — when the engine
          // rotated, we spin the slip 90° and re-anchor so it fills the rotated slot exactly.
          const tplW = selectedTemplate.width * PREVIEW_SCALE;
          const tplH = selectedTemplate.height * PREVIEW_SCALE;
          return (
            <div key={`f-${i}`} className="absolute" style={{ left: position.x * PREVIEW_SCALE, top: position.y * PREVIEW_SCALE, width: slipW, height: slipH }}>
              {rotated ? (
                <div style={{ width: tplW, height: tplH, transformOrigin: "top left", transform: `rotate(90deg) translateY(-${tplH}px)` }}>
                  <NameSlip student={student} template={selectedTemplate} scale={PREVIEW_SCALE} watermark={watermark} copyIndex={copyIndex} />
                </div>
              ) : (
                <NameSlip student={student} template={selectedTemplate} scale={PREVIEW_SCALE} watermark={watermark} copyIndex={copyIndex} />
              )}
            </div>
          );
        })}
        {emptyPositions.map((pos, i) => (
          <div key={`e-${i}`} className="absolute border border-dashed flex items-center justify-center" style={{ left: pos.x * PREVIEW_SCALE, top: pos.y * PREVIEW_SCALE, width: slipW, height: slipH, borderColor: "#ddd" }}>
            <span style={{ fontSize: 6, color: "#ccc" }}>Empty</span>
          </div>
        ))}
        {layoutConfig.showCropMarks && slotAssignments.map(({ position }, i) => (
          <CropMarks key={`c-${i}`} x={position.x * PREVIEW_SCALE} y={position.y * PREVIEW_SCALE} w={slipW} h={slipH} />
        ))}
      </div>
      </div>
      </div>
      {layoutResult && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{slotAssignments.length} of {layoutResult.totalSlips} slots • {layoutResult.cols}×{layoutResult.rows} grid</p>}
    </div>
  );
}

/* ====== Dispatcher ====== */
function NameSlip({ student, template, scale, watermark, copyIndex = 0 }: { student: Student; template: Template; scale: number; watermark: WatermarkConfig; copyIndex?: number }) {
  switch (template.id) {
    case "plain-pastel":        return <T1_PlainPastel s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "line-pattern":        return <T2_LinePattern s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "cartoon-fun":         return <T3_CartoonFun s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "wavy-pattern":        return <T4_WavyPattern s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "classic-traditional": return <T5_ClassicTraditional s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "plain-classic-noimage": return <T6_PlainClassicNoImage s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "anime-manga":         return <T7_AnimeManga s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "anime-neon":          return <T8_AnimeNeon s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "space":               return <T9_Space s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "football":            return <T10_Football s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "retro-y2k":           return <T11_RetroY2K s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    case "anime-card":          return <T12_AnimeCard s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
    default:                    return <T1_PlainPastel s={student} t={template} sc={scale} wm={watermark} ci={copyIndex} />;
  }
}

type SP = { s: Student; t: Template; sc: number; wm: WatermarkConfig; ci: number };

/* ====== Photo ====== */
function Pic({ url, size, round, border }: { url: string|null; size: number; round?: boolean; border?: string }) {
  const r = round ? "50%" : `${Math.max(3, size*0.08)}px`;
  if (url) return <img src={url} alt="" style={{ width: size, height: size, objectFit: "cover", borderRadius: r, border: border || "none", boxShadow: "0 3px 10px rgba(0,0,0,0.15)" }} />;
  return <div className="flex items-center justify-center" style={{ width: size, height: size, borderRadius: r, background: "rgba(255,255,255,0.4)", border: border || "2px dashed rgba(0,0,0,0.1)" }}><User style={{ width: "36%", height: "36%", color: "rgba(0,0,0,0.12)" }} /></div>;
}

/* ====== Field Components ====== */
function AutoText({ text, targetLen, baseSize, color, weight, style, className }: { text: string; targetLen: number; baseSize: number; color: string; weight: number; style?: React.CSSProperties; className?: string }) {
  const str = (text || " ").trim();
  const len = Math.max(4, str.length);
  const scale = len < targetLen ? Math.min(1.15, targetLen / len) : Math.max(0.6, targetLen / len);
  return <p className={className} style={{ ...style, fontSize: baseSize * scale, fontWeight: weight, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: style?.lineHeight || 1.2 }}>{str || " "}</p>;
}

/**
 * SmartName — fits a name (up to ~40 chars) into a fixed width × height box.
 *
 * Heuristic (no DOM measurement, runs at render-time):
 *  1. Pick a line count: 1 line if char count ≤ ~16, else 2 lines.
 *  2. Estimate per-character width ≈ 0.55 × font size at the given letter spacing.
 *     Solve for the largest font size where all lines fit within `boxWidth`.
 *  3. Cap by `boxHeight / lines` so vertical fit always wins.
 *  4. Float-balanced word-wrap into the chosen line count.
 *
 * Why no DOM measurement: this component renders inside SVG-rasterized exports
 * where `getBoundingClientRect` of the live preview doesn't apply. The estimate
 * is conservative on the small side, so text never overflows.
 */
function SmartName({ text, boxWidth, boxHeight, color, weight, fontFamily, letterSpacing = 0.6, textShadow, textTransform = "none" }: {
  text: string;
  boxWidth: number;
  boxHeight: number;
  color: string;
  weight: number;
  fontFamily?: string;
  letterSpacing?: number;
  textShadow?: string;
  textTransform?: "none" | "uppercase" | "lowercase";
}) {
  const raw = (text || "").trim();
  if (!raw) return null;

  // 1. Decide line count by character length.
  const len = raw.length;
  const lines: string[] = (() => {
    if (len <= 16) return [raw];
    // Find a balanced 2-line split on the closest space to the midpoint.
    const words = raw.split(/\s+/);
    if (words.length === 1) {
      // Single huge word — break at the midpoint by character.
      const mid = Math.ceil(raw.length / 2);
      return [raw.slice(0, mid), raw.slice(mid)];
    }
    let best: [string, string] = [raw, ""];
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const b = words.slice(i).join(" ");
      const diff = Math.abs(a.length - b.length);
      if (diff < bestDiff) { bestDiff = diff; best = [a, b]; }
    }
    return [best[0], best[1]];
  })();

  // 2. Longest line decides the width-bound font size.
  const longest = Math.max(...lines.map(l => l.length));
  // Per-char width factor: ~0.55em for proportional fonts, plus letter-spacing per char.
  const charWidthFactor = 0.55;
  const widthBoundSize = (boxWidth - longest * letterSpacing) / Math.max(1, longest * charWidthFactor);
  const heightBoundSize = boxHeight / lines.length / 1.05;
  const fontSize = Math.max(4, Math.min(widthBoundSize, heightBoundSize));

  return (
    <div style={{ width: boxWidth, height: boxHeight, display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
      {lines.map((line, i) => (
        <span key={i} style={{
          display: "block",
          fontFamily,
          fontSize,
          fontWeight: weight,
          color,
          letterSpacing,
          textTransform,
          lineHeight: 1,
          whiteSpace: "nowrap",
          textShadow,
        }}>{line}</span>
      ))}
    </div>
  );
}

function FieldLine({ label, value, f, color, lineColor, fm }: { label: string; value: string; f: number; color: string; lineColor: string; fm?: string }) {
  const str = (value || " ").trim();
  const len = Math.max(3, str.length);
  const scale = len > 10 ? Math.max(0.45, 10 / len) : 1;
  return (
    <div className="flex items-baseline" style={{ borderBottom: `1px solid ${lineColor}`, paddingBottom: Math.max(1, f*0.15), gap: f*0.25, fontFamily: fm }}>
      <span style={{ fontSize: f*0.82, fontWeight: 500, color, whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ flex: 1, fontSize: f * scale, fontWeight: 700, color: value ? "#1e293b" : "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value || "."}</span>
    </div>
  );
}

function StdRoll({ std, divis, roll, f, color, lineColor, fm }: { std: string; divis: string; roll: string; f: number; color: string; lineColor: string; fm?: string }) {
  const sLen = Math.max(2, (std || " ").trim().length);
  const sScale = sLen > 5 ? Math.max(0.45, 5 / sLen) : 1;
  const dLen = Math.max(1, (divis || " ").trim().length);
  const dScale = dLen > 3 ? Math.max(0.45, 3 / dLen) : 1;
  const rLen = Math.max(2, (roll || " ").trim().length);
  const rScale = rLen > 5 ? Math.max(0.45, 5 / rLen) : 1;
  return (
    <div className="flex" style={{ gap: f*0.4, fontFamily: fm }}>
      <div className="flex-1 flex items-baseline" style={{ borderBottom: `1px solid ${lineColor}`, paddingBottom: Math.max(1,f*0.15), gap: f*0.2 }}>
        <span style={{ fontSize: f*0.82, fontWeight: 500, color, whiteSpace: "nowrap" }}>Class:</span>
        <span style={{ flex: 1, fontSize: f * sScale, fontWeight: 700, color: std ? "#1e293b" : "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{std || "."}</span>
      </div>
      <div className="flex-1 flex items-baseline" style={{ borderBottom: `1px solid ${lineColor}`, paddingBottom: Math.max(1,f*0.15), gap: f*0.2 }}>
        <span style={{ fontSize: f*0.82, fontWeight: 500, color, whiteSpace: "nowrap" }}>Div:</span>
        <span style={{ flex: 1, fontSize: f * dScale, fontWeight: 700, color: divis ? "#1e293b" : "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{divis || "."}</span>
      </div>
      <div className="flex-1 flex items-baseline" style={{ borderBottom: `1px solid ${lineColor}`, paddingBottom: Math.max(1,f*0.15), gap: f*0.2 }}>
        <span style={{ fontSize: f*0.82, fontWeight: 500, color, whiteSpace: "nowrap" }}>Roll:</span>
        <span style={{ flex: 1, fontSize: f * rScale, fontWeight: 700, color: roll ? "#1e293b" : "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{roll || "."}</span>
      </div>
    </div>
  );
}

/* ============================================================
   T1: PLAIN PASTEL — solid soft color, ultra-clean, no pattern
   ============================================================ */
function T1_PlainPastel({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(5,sc*2);
  const ps=Math.min(w*0.32, h*0.82), pad=Math.max(3,h*0.06);
  const nf=Math.max(7,h*0.13), ff=Math.max(5,h*0.08);
  const cols = [
    { bg: "#e0e7ff", name: "#3730a3", accent: "#4f46e5", fld: "#6b7280", line: "#c7d2fe" }, // indigo
    { bg: "#fce7f3", name: "#9d174d", accent: "#db2777", fld: "#6b7280", line: "#f9a8d4" }, // pink
    { bg: "#dbeafe", name: "#1e40af", accent: "#2563eb", fld: "#6b7280", line: "#93c5fd" }, // blue
    { bg: "#d1fae5", name: "#065f46", accent: "#059669", fld: "#6b7280", line: "#6ee7b7" }, // green
    { bg: "#fef3c7", name: "#92400e", accent: "#d97706", fld: "#6b7280", line: "#fcd34d" }, // amber
    { bg: "#ede9fe", name: "#5b21b6", accent: "#7c3aed", fld: "#6b7280", line: "#c4b5fd" }, // violet
    { bg: "#cffafe", name: "#155e75", accent: "#0891b2", fld: "#6b7280", line: "#67e8f9" }, // cyan
    { bg: "#ffe4e6", name: "#9f1239", accent: "#e11d48", fld: "#6b7280", line: "#fda4af" }, // rose
  ];
  // Color rotates per copy AND offsets by name so different students don't collide on same copy index.
  const seed = (ci + ((s.name||"a").charCodeAt(0) % cols.length)) % cols.length;
  const c = cols[seed];
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: c.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontFamily: t.fontFamily }}>
      <div className="absolute inset-0 flex" style={{ padding: pad*0.6, zIndex: 1 }}>
        <div className="flex items-center justify-center" style={{ width: w*0.36 }}>
          <Pic url={s.aiImageUrl||s.imageUrl} size={ps} />
        </div>
        <div className="flex-1 flex items-center" style={{ paddingRight: pad*0.4 }}>
          <div className="w-full h-[88%] flex flex-col justify-between" style={{ background: "#fff", borderRadius: Math.max(4,sc*1.5), padding: `${pad*0.8}px ${pad}px`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf} color={c.name} weight={600} style={{ letterSpacing: 0.3, fontFamily: t.fontFamily }} />
            <FieldLine label="Subject:" value={s.subject} f={ff} color={c.fld} lineColor={c.line} fm={t.fontFamily} />
            <StdRoll std={s.className} divis={s.division} roll={s.rollNo} f={ff} color={c.fld} lineColor={c.line} fm={t.fontFamily} />
            <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.85} color={c.accent} weight={700} style={{ fontFamily: t.fontFamily }} />
          </div>
        </div>
      </div>
      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/* ============================================================
   T2: LINE PATTERN — diagonal stripe pattern background
   ============================================================ */
function T2_LinePattern({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(5,sc*2);
  const ps=Math.min(w*0.32, h*0.82), pad=Math.max(3,h*0.06);
  const nf=Math.max(7,h*0.13), ff=Math.max(5,h*0.08);
  const cols = [
    { base: "#e0f2fe", stripe: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.15)", pic: "rgba(14,165,233,0.3)", name: "#0c4a6e", line: "#bae6fd", accent: "#0284c7" },
    { base: "#fce7f3", stripe: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.15)", pic: "rgba(236,72,153,0.3)", name: "#831843", line: "#fbcfe8", accent: "#be185d" },
    { base: "#fef3c7", stripe: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.15)", pic: "rgba(245,158,11,0.3)", name: "#78350f", line: "#fde68a", accent: "#b45309" },
    { base: "#d1fae5", stripe: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.15)", pic: "rgba(16,185,129,0.3)", name: "#022c22", line: "#a7f3d0", accent: "#047857" },
    { base: "#ede9fe", stripe: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.15)", pic: "rgba(139,92,246,0.3)", name: "#4c1d95", line: "#ddd6fe", accent: "#6d28d9" },
  ];
  const seed = (ci + ((s.name||"a").charCodeAt(0) % cols.length)) % cols.length;
  const c = cols[seed];
  const stripeSize = Math.max(4, sc*2);
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: c.base, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontFamily: t.fontFamily }}>
      <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent ${stripeSize}px, ${c.stripe} ${stripeSize}px, ${c.stripe} ${stripeSize*2}px)` }} />
      <div className="absolute inset-0 flex" style={{ padding: pad*0.6, zIndex: 1 }}>
        <div className="flex items-center justify-center" style={{ width: w*0.36 }}>
          <Pic url={s.aiImageUrl||s.imageUrl} size={ps} border={`3px solid ${c.pic}`} />
        </div>
        <div className="flex-1 flex items-center" style={{ paddingRight: pad*0.4 }}>
          <div className="w-full h-[88%] flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.95)", borderRadius: Math.max(4,sc*1.5), padding: `${pad*0.8}px ${pad}px`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: `1px solid ${c.border}` }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf} color={c.name} weight={600} style={{ letterSpacing: 0.3, fontFamily: t.fontFamily }} />
            <FieldLine label="Subject:" value={s.subject} f={ff} color="#64748b" lineColor={c.line} fm={t.fontFamily} />
            <StdRoll std={s.className} divis={s.division} roll={s.rollNo} f={ff} color="#64748b" lineColor={c.line} fm={t.fontFamily} />
            <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.85} color={c.accent} weight={700} style={{ fontFamily: t.fontFamily }} />
          </div>
        </div>
      </div>
      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/* ============================================================
   T3: CARTOON FUN — uses passion-themed background image
   ============================================================ */
function T3_CartoonFun({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(5,sc*2);
  // Each copy of a student rotates through a different cartoon background+accent so 10 copies look 10 different.
  const variants = [
    { bg: "/backgrounds/doctor.png",      color: "#0284c7" },
    { bg: "/backgrounds/engineer.png",    color: "#ea580c" },
    { bg: "/backgrounds/scientist.png",   color: "#7c3aed" },
    { bg: "/backgrounds/pilot.png",       color: "#2563eb" },
    { bg: "/backgrounds/artist.png",      color: "#db2777" },
    { bg: "/backgrounds/nature.png",      color: "#059669" },
    { bg: "/backgrounds/chef.png",        color: "#f59e0b" },
    { bg: "/backgrounds/astronaut.png",   color: "#6366f1" },
    { bg: "/backgrounds/musician.png",    color: "#ec4899" },
    { bg: "/backgrounds/athlete.png",     color: "#ef4444" },
    { bg: "/backgrounds/firefighter.png", color: "#f97316" },
    { bg: "/backgrounds/police.png",      color: "#3b82f6" },
    { bg: "/backgrounds/classroom.png",   color: "#10b981" },
    { bg: "/backgrounds/ocean.png",       color: "#06b6d4" },
    { bg: "/backgrounds/forest.png",      color: "#22c55e" },
    { bg: "/backgrounds/rainbow.png",     color: "#a855f7" },
  ];
  const studentBase = getPassionTheme(s.passion || "Other");
  const nameSeed = (s.name || "").charCodeAt(0) || 0;
  const v = variants[(ci + nameSeed) % variants.length];
  // Fall back to passion theme color if variant doesn't define one cleanly.
  const accent = v.color || studentBase.color;
  const ps=Math.min(w*0.32, h*0.82), pad=Math.max(3,h*0.06);
  const nf=Math.max(7,h*0.13), ff=Math.max(5,h*0.08);
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", fontFamily: t.fontFamily }}>
      <img src={v.bg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(1.05) saturate(1.1)" }} />
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="absolute inset-0 flex" style={{ padding: pad*0.6, zIndex: 1 }}>
        <div className="flex items-center justify-center" style={{ width: w*0.36 }}>
          <Pic url={s.aiImageUrl||s.imageUrl} size={ps} border="3px solid rgba(255,255,255,0.85)" />
        </div>
        <div className="flex-1 flex items-center" style={{ paddingRight: pad*0.4 }}>
          <div className="w-full h-[88%] flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.92)", borderRadius: Math.max(4,sc*1.5), padding: `${pad*0.8}px ${pad}px`, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", backdropFilter: "blur(4px)" }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf} color="#1e293b" weight={600} style={{ letterSpacing: 0.3, fontFamily: t.fontFamily }} />
            <FieldLine label="Subject:" value={s.subject} f={ff} color="#6b7280" lineColor="#d1d5db" fm={t.fontFamily} />
            <StdRoll std={s.className} divis={s.division} roll={s.rollNo} f={ff} color="#6b7280" lineColor="#d1d5db" fm={t.fontFamily} />
            <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.85} color={accent} weight={700} style={{ fontFamily: t.fontFamily }} />
          </div>
        </div>
      </div>
      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/* ============================================================
   T4: WAVY PATTERN — organic wavy shapes in background
   ============================================================ */
function T4_WavyPattern({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(5,sc*2);
  const ps=Math.min(w*0.32, h*0.82), pad=Math.max(3,h*0.06);
  const nf=Math.max(7,h*0.13), ff=Math.max(5,h*0.08);
  const cols = [
    { bg: "linear-gradient(135deg, #fdf2f8, #fce7f3, #fbcfe8)", wave1: "rgba(244,114,182,0.15)", wave2: "rgba(236,72,153,0.1)", circ1: "rgba(244,114,182,0.12)", circ2: "rgba(236,72,153,0.1)", name: "#9d174d", line: "#f9a8d4", accent: "#db2777" },
    { bg: "linear-gradient(135deg, #e0f2fe, #bae6fd, #7dd3fc)", wave1: "rgba(56,189,248,0.15)", wave2: "rgba(14,165,233,0.1)", circ1: "rgba(56,189,248,0.12)", circ2: "rgba(14,165,233,0.1)", name: "#0c4a6e", line: "#bae6fd", accent: "#0284c7" },
    { bg: "linear-gradient(135deg, #ecfdf5, #d1fae5, #a7f3d0)", wave1: "rgba(52,211,153,0.15)", wave2: "rgba(16,185,129,0.1)", circ1: "rgba(52,211,153,0.12)", circ2: "rgba(16,185,129,0.1)", name: "#064e3b", line: "#6ee7b7", accent: "#059669" },
    { bg: "linear-gradient(135deg, #fffbeb, #fef3c7, #fde68a)", wave1: "rgba(251,191,36,0.15)", wave2: "rgba(245,158,11,0.1)", circ1: "rgba(251,191,36,0.12)", circ2: "rgba(245,158,11,0.1)", name: "#78350f", line: "#fcd34d", accent: "#b45309" },
    { bg: "linear-gradient(135deg, #faf5ff, #f3e8ff, #e9d5ff)", wave1: "rgba(192,132,252,0.15)", wave2: "rgba(168,85,247,0.1)", circ1: "rgba(192,132,252,0.12)", circ2: "rgba(168,85,247,0.1)", name: "#3b0764", line: "#d8b4fe", accent: "#7e22ce" },
  ];
  const seed = (ci + ((s.name||"a").charCodeAt(0) % cols.length)) % cols.length;
  const c = cols[seed];
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: c.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontFamily: t.fontFamily }}>
      {/* Wavy shapes using CSS */}
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={`M0,${h*0.7} C${w*0.25},${h*0.5} ${w*0.5},${h*0.9} ${w},${h*0.65} L${w},${h} L0,${h} Z`} fill={c.wave1} />
        <path d={`M0,${h*0.85} C${w*0.3},${h*0.7} ${w*0.6},${h} ${w},${h*0.8} L${w},${h} L0,${h} Z`} fill={c.wave2} />
        <circle cx={w*0.85} cy={h*0.2} r={w*0.12} fill={c.circ1} />
        <circle cx={w*0.1} cy={h*0.15} r={w*0.06} fill={c.circ2} />
      </svg>
      <div className="absolute inset-0 flex" style={{ padding: pad*0.6, zIndex: 1 }}>
        <div className="flex items-center justify-center" style={{ width: w*0.36 }}>
          <Pic url={s.aiImageUrl||s.imageUrl} size={ps} round />
        </div>
        <div className="flex-1 flex items-center" style={{ paddingRight: pad*0.4 }}>
          <div className="w-full h-[88%] flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.92)", borderRadius: Math.max(4,sc*1.5), padding: `${pad*0.8}px ${pad}px`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf} color={c.name} weight={600} style={{ letterSpacing: 0.3, fontFamily: t.fontFamily }} />
            <FieldLine label="Subject:" value={s.subject} f={ff} color="#6b7280" lineColor={c.line} fm={t.fontFamily} />
            <StdRoll std={s.className} divis={s.division} roll={s.rollNo} f={ff} color="#6b7280" lineColor={c.line} fm={t.fontFamily} />
            <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.85} color={c.accent} weight={700} style={{ fontFamily: t.fontFamily }} />
          </div>
        </div>
      </div>
      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/* ============================================================
   T5: CLASSIC TRADITIONAL — formal bordered, serif, school style
   ============================================================ */
function T5_ClassicTraditional({ s, t, sc, wm }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(3,sc*1);
  const ps=Math.min(w*0.28, h*0.76), pad=Math.max(3,h*0.06);
  const nf=Math.max(7,h*0.13), ff=Math.max(5,h*0.08);
  const F = "'Roboto', sans-serif";
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: "radial-gradient(circle at center, #fffef5 0%, #f5ebd5 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      {/* Decorative Vintage Frame */}
      <div className="absolute" style={{ inset: Math.max(3,sc*1), border: "2px solid #5a3e1b", borderRadius: Math.max(2,sc*0.5) }} />
      <div className="absolute" style={{ inset: Math.max(5,sc*1.6), border: "1px solid #8b6914", borderRadius: Math.max(1,sc*0.3) }} />
      {/* Corner accents */}
      <div className="absolute top-0 left-0" style={{ width: sc*5, height: sc*5, borderBottomRightRadius: "100%", border: "1px solid #8b6914", borderTop: "none", borderLeft: "none" }} />
      <div className="absolute top-0 right-0" style={{ width: sc*5, height: sc*5, borderBottomLeftRadius: "100%", border: "1px solid #8b6914", borderTop: "none", borderRight: "none" }} />
      <div className="absolute bottom-0 left-0" style={{ width: sc*5, height: sc*5, borderTopRightRadius: "100%", border: "1px solid #8b6914", borderBottom: "none", borderLeft: "none" }} />
      <div className="absolute bottom-0 right-0" style={{ width: sc*5, height: sc*5, borderTopLeftRadius: "100%", border: "1px solid #8b6914", borderBottom: "none", borderRight: "none" }} />

      <div className="absolute inset-0 flex" style={{ padding: pad*1.2, zIndex: 1 }}>
        <div className="flex items-center justify-center" style={{ width: w*0.32 }}>
          <Pic url={s.aiImageUrl||s.imageUrl} size={ps} border="2.5px solid #5a3e1b" />
        </div>
        <div className="flex-1 flex flex-col justify-between" style={{ paddingLeft: pad*0.8, paddingRight: pad*0.3, paddingTop: pad*0.3, paddingBottom: pad*0.3 }}>
          <div style={{ textAlign: "center" }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf} color="#2d1810" weight={600} style={{ fontFamily: F, letterSpacing: 0.2, margin: "0 auto" }} />
          </div>
          <div className="flex flex-col" style={{ gap: pad*0.5 }}>
            <DottedField l="Subject" v={s.subject} f={ff} lf={ff*0.85} fm={F} />
            <div className="flex" style={{ gap: ff*0.5 }}>
              <DottedField l="Class" v={s.className} f={ff} lf={ff*0.85} fm={F} />
              <DottedField l="Div" v={s.division} f={ff} lf={ff*0.85} fm={F} />
              <DottedField l="Roll" v={s.rollNo} f={ff} lf={ff*0.85} fm={F} />
            </div>
          </div>
          <AutoText text={s.schoolName || "School Name"} targetLen={22} baseSize={ff*0.9} color="#8b6914" weight={700} style={{ fontFamily: F, textAlign: "center", borderTop: "1px solid #daa520", paddingTop: 2 }} />
        </div>
      </div>
      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/* ============================================================
   T6: PLAIN CLASSIC (NO IMAGE) — text spans full width perfectly centered
   ============================================================ */
function T6_PlainClassicNoImage({ s, t, sc, wm }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(3,sc*1);
  const pad=Math.max(3,h*0.06);
  const nf=Math.max(7,h*0.13), ff=Math.max(5,h*0.08);
  const F = "'Roboto', sans-serif";
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: "radial-gradient(circle at center, #fffef5 0%, #f5ebd5 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      {/* Decorative Vintage Frame */}
      <div className="absolute" style={{ inset: Math.max(3,sc*1), border: "2px solid #5a3e1b", borderRadius: Math.max(2,sc*0.5) }} />
      <div className="absolute" style={{ inset: Math.max(5,sc*1.6), border: "1px solid #8b6914", borderRadius: Math.max(1,sc*0.3) }} />
      <div className="absolute top-0 left-0" style={{ width: sc*5, height: sc*5, borderBottomRightRadius: "100%", border: "1px solid #8b6914", borderTop: "none", borderLeft: "none" }} />
      <div className="absolute top-0 right-0" style={{ width: sc*5, height: sc*5, borderBottomLeftRadius: "100%", border: "1px solid #8b6914", borderTop: "none", borderRight: "none" }} />
      <div className="absolute bottom-0 left-0" style={{ width: sc*5, height: sc*5, borderTopRightRadius: "100%", border: "1px solid #8b6914", borderBottom: "none", borderLeft: "none" }} />
      <div className="absolute bottom-0 right-0" style={{ width: sc*5, height: sc*5, borderTopLeftRadius: "100%", border: "1px solid #8b6914", borderBottom: "none", borderRight: "none" }} />

      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: pad*1.5, zIndex: 1 }}>
        <div style={{ textAlign: "center" }}>
          <AutoText text={s.name} targetLen={12} baseSize={nf} color="#2d1810" weight={600} style={{ fontFamily: F, letterSpacing: 0.2, margin: "0 auto" }} />
        </div>
        
        <div className="flex flex-col" style={{ gap: pad*0.6 }}>
          <DottedField l="Subject" v={s.subject} f={ff} lf={ff*0.85} fm={F} />
          <div className="flex" style={{ gap: ff*0.8 }}>
            <DottedField l="Class" v={s.className} f={ff} lf={ff*0.85} fm={F} />
            <DottedField l="Div" v={s.division} f={ff} lf={ff*0.85} fm={F} />
            <DottedField l="Roll" v={s.rollNo} f={ff} lf={ff*0.85} fm={F} />
          </div>
        </div>

        <AutoText text={s.schoolName || "School Name"} targetLen={30} baseSize={ff*0.9} color="#8b6914" weight={700} style={{ fontFamily: F, textAlign: "center", borderTop: "1px solid #daa520", paddingTop: 2 }} />
      </div>
      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/* ============================================================
   T7: ANIME MANGA PANEL
   Hand-inked panel with radial speed-burst, hexagonal photo, action-line
   halftone, diagonal power stripe, swoosh banner, corner spark stars.
   ============================================================ */
function T7_AnimeManga({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(4,sc*1.2);
  const pad=Math.max(3,h*0.06);

  // Five anime palettes — each copy rotates so a class sheet looks like a character roster.
  const palettes = [
    { name: "Sakura",   bgA: "#ffeaf3", bgB: "#ffc8dc", ink: "#150811", accent: "#ec4899", deep: "#9d174d", glow: "#fff5fb", burst: "rgba(236,72,153,0.55)", halftone: "rgba(157,23,77,0.55)" },
    { name: "Cyber",    bgA: "#ddf6ff", bgB: "#88e2ee", ink: "#03212c", accent: "#06b6d4", deep: "#0e7490", glow: "#f0fcff", burst: "rgba(6,182,212,0.55)",  halftone: "rgba(14,116,144,0.55)" },
    { name: "Sunset",   bgA: "#fff0db", bgB: "#ffc78a", ink: "#2a1102", accent: "#f97316", deep: "#9a3412", glow: "#fff8ec", burst: "rgba(249,115,22,0.55)", halftone: "rgba(154,52,18,0.55)" },
    { name: "Electric", bgA: "#ece1ff", bgB: "#c8a4ff", ink: "#160626", accent: "#a855f7", deep: "#6b21a8", glow: "#f7f1ff", burst: "rgba(168,85,247,0.55)", halftone: "rgba(107,33,168,0.55)" },
    { name: "Mint",     bgA: "#dcfdf0", bgB: "#9ee9c4", ink: "#0a1f15", accent: "#10b981", deep: "#065f46", glow: "#effff7", burst: "rgba(16,185,129,0.55)", halftone: "rgba(6,95,70,0.55)" },
  ];
  const seed = (ci + ((s.name||"a").charCodeAt(0))) % palettes.length;
  const p = palettes[seed];

  // ====== ZONE LAYOUT (no overlaps) ======
  // Vertical: top zone = name + fields (0 .. 0.78h). Bottom zone = school stripe (0.78h .. h).
  // Horizontal in top zone: photo column (0 .. 0.42w). Text column (0.44w .. w-pad).
  const STRIPE_TOP = h * 0.78;
  const STRIPE_H = h - STRIPE_TOP;

  // Photo geometry — vertically centered inside the top zone (not the whole card).
  const topZoneH = STRIPE_TOP;
  const ps = Math.min(w*0.36, topZoneH*0.86);
  const photoCx = w * 0.21;
  const photoCy = topZoneH * 0.5;
  const ink = Math.max(0.8, sc*0.35);

  // Hexagonal frame helpers
  const hex = (cx: number, cy: number, rad: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (60 * i) * Math.PI / 180;
      pts.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`);
    }
    return pts.join(" ");
  };
  const photoR = ps / 2;
  const hexInner = hex(photoCx, photoCy, photoR);
  const hexMid   = hex(photoCx, photoCy, photoR + sc*0.9);
  const hexOuter = hex(photoCx, photoCy, photoR + sc*1.8);

  // Speed burst — masked behind the photo
  const SPEED_COUNT = 24;
  const speedLines = Array.from({ length: SPEED_COUNT }, (_, i) => {
    const angle = (i / SPEED_COUNT) * 360 + (seed * 7);
    const innerR = photoR + sc * 1.5;
    const outerR = Math.max(w, h) * 1.2;
    const rad = angle * Math.PI / 180;
    return {
      x1: photoCx + Math.cos(rad) * innerR,
      y1: photoCy + Math.sin(rad) * innerR,
      x2: photoCx + Math.cos(rad) * outerR,
      y2: photoCy + Math.sin(rad) * outerR,
      thick: ((i * 13) % 5) === 0 ? sc * 0.6 : sc * 0.3,
    };
  });

  // Spark stars
  const spark = (cx: number, cy: number, size: number) => {
    const points: string[] = [];
    const spikes = 8;
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? size : size * 0.38;
      points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
    }
    return points.join(" ");
  };

  // Type sizes scaled to the *top zone* height (not full card) so they don't overflow into the stripe.
  const nf = Math.max(7, topZoneH * 0.20);
  const ff = Math.max(5, topZoneH * 0.105);
  const sf = Math.max(5, STRIPE_H * 0.42); // school stripe text — sized to stripe height

  // Text column geometry
  const txtLeft = w * 0.44;
  const txtRight = pad * 0.7;

  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: `linear-gradient(135deg, ${p.bgA}, ${p.bgB})`, boxShadow: "0 2px 12px rgba(0,0,0,0.22)", fontFamily: t.fontFamily, color: p.ink }}>

      {/* Background SVG: halftone, speed burst, photo frame, stripe, sparks, border */}
      <svg className="absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ zIndex: 0 }}>
        <defs>
          <radialGradient id={`htg-${seed}`} cx={photoCx} cy={photoCy} r={Math.max(w, h) * 0.85} gradientUnits="userSpaceOnUse">
            <stop offset="0"    stopColor={p.halftone} stopOpacity="0.85" />
            <stop offset="0.55" stopColor={p.halftone} stopOpacity="0.35" />
            <stop offset="1"    stopColor={p.halftone} stopOpacity="0" />
          </radialGradient>
          <pattern id={`dots-${seed}`} x="0" y="0" width={Math.max(2.4, sc*1.2)} height={Math.max(2.4, sc*1.2)} patternUnits="userSpaceOnUse">
            <circle cx={Math.max(1.2, sc*0.6)} cy={Math.max(1.2, sc*0.6)} r={Math.max(0.6, sc*0.32)} fill={p.ink} />
          </pattern>
          <mask id={`htmask-${seed}`}>
            <rect x="0" y="0" width={w} height={STRIPE_TOP} fill={`url(#htg-${seed})`} />
          </mask>
          <mask id={`speedmask-${seed}`}>
            <rect x="0" y="0" width={w} height={STRIPE_TOP} fill="white" />
            <polygon points={hexInner} fill="black" />
          </mask>
        </defs>

        {/* Halftone — only inside the top zone */}
        <rect x="0" y="0" width={w} height={STRIPE_TOP} fill={`url(#dots-${seed})`} mask={`url(#htmask-${seed})`} opacity="0.55" />

        {/* Speed burst — also clipped to the top zone */}
        <g mask={`url(#speedmask-${seed})`}>
          {speedLines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={p.burst} strokeWidth={l.thick} strokeLinecap="round" />
          ))}
        </g>

        {/* Hex photo frame layers (drawn before the photo, but photo sits in HTML on top) */}
        <polygon points={hexOuter} fill={p.ink} />
        <polygon points={hexMid} fill={p.accent} />
        <polygon points={hex(photoCx, photoCy, photoR + sc*0.2)} fill={p.glow} />

        {/* Sparks in top-right and bottom-left of the TOP zone (so they don't collide with the stripe) */}
        <polygon points={spark(w - pad*1.4, pad*1.6, sc*1.6)} fill={p.accent} stroke={p.ink} strokeWidth={ink*0.8} />
        <polygon points={spark(w - pad*2.8, pad*0.9, sc*0.9)} fill={p.glow}   stroke={p.ink} strokeWidth={ink*0.6} />
        <polygon points={spark(pad*1.4, STRIPE_TOP - pad*1.0, sc*1.0)} fill={p.accent} stroke={p.ink} strokeWidth={ink*0.7} />

        {/* HORIZONTAL bottom power-stripe with a slanted top edge (clip-path lookalike via polygon) */}
        <polygon
          points={`0,${STRIPE_TOP} ${w*0.18},${STRIPE_TOP - h*0.04} ${w},${STRIPE_TOP - h*0.02} ${w},${h} 0,${h}`}
          fill={p.ink}
        />
        {/* Top thin accent line on the stripe */}
        <polyline
          points={`0,${STRIPE_TOP + Math.max(1, sc*0.4)} ${w*0.18},${STRIPE_TOP - h*0.04 + Math.max(1, sc*0.4)} ${w},${STRIPE_TOP - h*0.02 + Math.max(1, sc*0.4)}`}
          stroke={p.accent} strokeWidth={Math.max(0.8, sc*0.35)} fill="none"
        />

        {/* Outer ink panel border */}
        <rect x={ink*0.5} y={ink*0.5} width={w - ink} height={h - ink} rx={r} ry={r}
          fill="none" stroke={p.ink} strokeWidth={Math.max(1.2, sc*0.55)} />
      </svg>

      {/* Photo, clipped to inner hex */}
      <div className="absolute" style={{
        left: photoCx - photoR, top: photoCy - photoR,
        width: ps, height: ps,
        clipPath: `polygon(75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%, 25% 0%)`,
        zIndex: 2,
      }}>
        {(s.aiImageUrl || s.imageUrl)
          ? <img src={s.aiImageUrl || s.imageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: p.glow, display: "flex", alignItems: "center", justifyContent: "center" }}><User style={{ width: "40%", height: "40%", color: p.ink, opacity: 0.18 }} /></div>}
      </div>

      {/* TEXT COLUMN — strictly inside the top zone */}
      <div className="absolute flex flex-col justify-between" style={{
        left: txtLeft,
        right: txtRight,
        top: pad * 0.6,
        height: STRIPE_TOP - pad * 1.2,
        zIndex: 3,
        gap: ff * 0.4,
      }}>
        {/* Name — auto-wraps to 2 lines for long names (up to ~40 chars) */}
        <div style={{ flexShrink: 0 }}>
          <SmartName
            text={s.name}
            boxWidth={w - txtLeft - txtRight}
            boxHeight={nf * 2.1}
            color={p.ink}
            weight={700}
            fontFamily={t.fontFamily}
            letterSpacing={1.2}
            textTransform="uppercase"
            textShadow={`${Math.max(1, sc*0.4)}px ${Math.max(1, sc*0.4)}px 0 ${p.accent}, ${Math.max(1.6, sc*0.7)}px ${Math.max(1.6, sc*0.7)}px 0 ${p.ink}`}
          />
        </div>

        {/* Field rows */}
        <div className="flex flex-col" style={{ gap: ff*0.32 }}>
          <FieldRowAnime label="SUBJECT" value={s.subject} f={ff} ink={p.ink} accent={p.accent} fm={t.fontFamily} />
          <div className="flex" style={{ gap: ff*0.5 }}>
            <FieldRowAnime label="CLASS" value={s.className} f={ff} ink={p.ink} accent={p.accent} fm={t.fontFamily} />
            <FieldRowAnime label="DIV"   value={s.division}  f={ff} ink={p.ink} accent={p.accent} fm={t.fontFamily} />
            <FieldRowAnime label="ROLL"  value={s.rollNo}    f={ff} ink={p.ink} accent={p.accent} fm={t.fontFamily} />
          </div>
        </div>
      </div>

      {/* SCHOOL NAME — horizontal, centered inside the bottom stripe (no rotation) */}
      <div className="absolute flex items-center justify-center" style={{
        left: pad,
        right: pad,
        top: STRIPE_TOP,
        height: STRIPE_H,
        zIndex: 4,
        pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: t.fontFamily,
          fontSize: sf,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 1.8,
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap" as const,
          overflow: "hidden",
          textOverflow: "ellipsis" as const,
          maxWidth: "100%",
          textShadow: `${Math.max(0.6, sc*0.22)}px ${Math.max(0.6, sc*0.22)}px 0 ${p.deep}`,
        }}>
          ★ {(s.schoolName || "School").slice(0, 24)} ★
        </span>
      </div>

      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/* ============================================================
   T8: ANIME NEON CARD
   Cyberpunk holo-ID — dark gradient, neon outline + scanlines,
   square photo with corner brackets, katakana-style side ribbon,
   pixel-tag fields, name with neon glow + chromatic offset.
   ============================================================ */
function T8_AnimeNeon({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(4,sc*1.4);
  const pad=Math.max(3,h*0.06);

  // Five neon palettes — each copy rotates so siblings have distinct vibes.
  const palettes = [
    { name: "Magenta", bgA: "#1a0820", bgB: "#3a0d3a", neonA: "#ff2d95", neonB: "#7c3aed", glow: "rgba(255,45,149,0.55)", line: "rgba(255,45,149,0.2)", text: "#ffe2f2", katakana: "サクラ" },
    { name: "Cyan",    bgA: "#06182a", bgB: "#0c2942", neonA: "#22d3ee", neonB: "#3b82f6", glow: "rgba(34,211,238,0.55)",  line: "rgba(34,211,238,0.18)", text: "#dffaff", katakana: "サイバー" },
    { name: "Acid",    bgA: "#0a1f08", bgB: "#102b15", neonA: "#a3e635", neonB: "#22c55e", glow: "rgba(163,230,53,0.55)",  line: "rgba(163,230,53,0.18)", text: "#eaffd0", katakana: "ネオン" },
    { name: "Sunset",  bgA: "#220a08", bgB: "#3a1206", neonA: "#fb923c", neonB: "#ef4444", glow: "rgba(251,146,60,0.55)",  line: "rgba(251,146,60,0.2)",  text: "#fff1e0", katakana: "ユウヒ" },
    { name: "Violet",  bgA: "#150a2a", bgB: "#251040", neonA: "#a78bfa", neonB: "#22d3ee", glow: "rgba(167,139,250,0.55)", line: "rgba(167,139,250,0.18)", text: "#ece1ff", katakana: "デンキ" },
  ];
  const seed = (ci + ((s.name||"a").charCodeAt(0))) % palettes.length;
  const p = palettes[seed];

  const ink = Math.max(0.8, sc*0.35);

  // Photo geometry — square, left side, with corner brackets
  const ps = Math.min(w*0.32, h*0.78);
  const photoX = pad * 1.1;
  const photoY = (h - ps) / 2;

  // Vertical katakana ribbon column on the far left
  const ribbonW = Math.max(4, w * 0.06);

  // Text column boundaries (right of photo, left of any right-edge accents)
  const txtLeft = photoX + ps + pad * 0.9;
  const txtRight = pad * 0.9;

  // Field block — bottom 40% of the right column
  const ff = Math.max(5, h * 0.085);

  // Name box — top 50% of the right column, fits up to 2 lines via SmartName
  const NAME_TOP = pad * 0.6;
  const NAME_BOTTOM = h * 0.52;
  const nameBoxW = w - txtLeft - txtRight;
  const nameBoxH = NAME_BOTTOM - NAME_TOP;

  // Scanlines (decorative horizontal CRT lines across the whole card)
  const scanlineGap = Math.max(2.4, sc*1.1);

  // Corner-bracket length for the photo
  const brkLen = Math.max(3, sc * 1.6);
  const brkW = Math.max(0.8, sc * 0.45);

  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: `linear-gradient(135deg, ${p.bgA}, ${p.bgB})`, boxShadow: "0 2px 12px rgba(0,0,0,0.35)", fontFamily: t.fontFamily, color: p.text }}>

      {/* Scanlines (CRT effect) */}
      <div className="absolute inset-0" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0, transparent ${scanlineGap - 0.5}px, ${p.line} ${scanlineGap - 0.5}px, ${p.line} ${scanlineGap}px)`,
        opacity: 0.6,
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* Background SVG: glow underlay, corner brackets, neon outline, ribbon */}
      <svg className="absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id={`neon-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0"   stopColor={p.neonA} />
            <stop offset="0.5" stopColor={p.neonB} />
            <stop offset="1"   stopColor={p.neonA} />
          </linearGradient>
          <linearGradient id={`ribbon-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.neonA} />
            <stop offset="1" stopColor={p.neonB} />
          </linearGradient>
          <radialGradient id={`vignette-${seed}`} cx="0.18" cy="0.5" r="0.6">
            <stop offset="0" stopColor={p.glow} stopOpacity="0.35" />
            <stop offset="1" stopColor={p.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow underlay behind the photo zone */}
        <rect x="0" y="0" width={w} height={h} fill={`url(#vignette-${seed})`} />

        {/* Vertical katakana ribbon (left edge) */}
        <rect x="0" y="0" width={ribbonW} height={h} fill={`url(#ribbon-${seed})`} />

        {/* Hairline white edge between ribbon and main panel */}
        <line x1={ribbonW} y1="0" x2={ribbonW} y2={h} stroke="rgba(255,255,255,0.25)" strokeWidth={Math.max(0.4, sc*0.15)} />

        {/* Corner brackets around photo — top-left, top-right, bottom-left, bottom-right */}
        {/* TL */}
        <line x1={photoX} y1={photoY} x2={photoX + brkLen} y2={photoY} stroke={p.neonA} strokeWidth={brkW} strokeLinecap="round" />
        <line x1={photoX} y1={photoY} x2={photoX} y2={photoY + brkLen} stroke={p.neonA} strokeWidth={brkW} strokeLinecap="round" />
        {/* TR */}
        <line x1={photoX + ps} y1={photoY} x2={photoX + ps - brkLen} y2={photoY} stroke={p.neonA} strokeWidth={brkW} strokeLinecap="round" />
        <line x1={photoX + ps} y1={photoY} x2={photoX + ps} y2={photoY + brkLen} stroke={p.neonA} strokeWidth={brkW} strokeLinecap="round" />
        {/* BL */}
        <line x1={photoX} y1={photoY + ps} x2={photoX + brkLen} y2={photoY + ps} stroke={p.neonA} strokeWidth={brkW} strokeLinecap="round" />
        <line x1={photoX} y1={photoY + ps} x2={photoX} y2={photoY + ps - brkLen} stroke={p.neonA} strokeWidth={brkW} strokeLinecap="round" />
        {/* BR */}
        <line x1={photoX + ps} y1={photoY + ps} x2={photoX + ps - brkLen} y2={photoY + ps} stroke={p.neonA} strokeWidth={brkW} strokeLinecap="round" />
        <line x1={photoX + ps} y1={photoY + ps} x2={photoX + ps} y2={photoY + ps - brkLen} stroke={p.neonA} strokeWidth={brkW} strokeLinecap="round" />

        {/* Outer neon outline (last so it sits on top of the scanlines) */}
        <rect x={ink*0.6} y={ink*0.6} width={w - ink*1.2} height={h - ink*1.2} rx={r} ry={r}
          fill="none" stroke={`url(#neon-${seed})`} strokeWidth={Math.max(1.2, sc*0.55)} />

        {/* "DATA CARD" tag in top-right corner */}
        <g transform={`translate(${w - pad*4}, ${pad*0.6})`}>
          <rect x="0" y="0" width={pad*3.2} height={pad*1.1} rx={Math.max(1, sc*0.3)} fill={p.neonA} />
          <text x={pad*1.6} y={pad*0.85} textAnchor="middle"
            fontFamily={t.fontFamily} fontSize={Math.max(4, sc*1.3)} fontWeight="700"
            fill={p.bgA} letterSpacing={Math.max(0.5, sc*0.15)}>
            ID-{String((seed + 1)).padStart(2, "0")}
          </text>
        </g>
      </svg>

      {/* Vertical katakana text inside the ribbon */}
      <div className="absolute" style={{
        left: 0, top: 0, width: ribbonW, height: h, zIndex: 2,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{
          writingMode: "vertical-rl",
          fontFamily: t.fontFamily,
          fontSize: Math.max(5, ribbonW * 0.55),
          fontWeight: 700,
          color: p.bgA,
          letterSpacing: Math.max(1, sc*0.4),
          textTransform: "uppercase" as const,
        }}>{p.katakana}</span>
      </div>

      {/* Photo — square, hard corners, with subtle inner ring */}
      <div className="absolute" style={{
        left: photoX, top: photoY, width: ps, height: ps,
        boxShadow: `inset 0 0 0 ${Math.max(0.6, sc*0.25)}px rgba(255,255,255,0.15), 0 0 ${sc*3}px ${p.glow}`,
        background: p.bgA,
        zIndex: 2,
        overflow: "hidden",
        borderRadius: Math.max(1, sc*0.4),
      }}>
        {(s.aiImageUrl || s.imageUrl)
          ? <img src={s.aiImageUrl || s.imageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User style={{ width: "40%", height: "40%", color: p.text, opacity: 0.25 }} /></div>}
      </div>

      {/* TEXT COLUMN — white writing card on the dark backdrop */}
      <div className="absolute" style={{
        left: txtLeft, right: txtRight,
        top: NAME_TOP, height: h - NAME_TOP - pad*0.6,
        zIndex: 3,
      }}>
        <WriteCard accent={p.neonA} dark={p.bgA} sc={sc} padX={pad*0.5} padY={pad*0.35}>
          {/* Name — dark on white now, no neon glow needed */}
          <SmartName
            text={s.name}
            boxWidth={nameBoxW - pad}
            boxHeight={nameBoxH - pad*0.4}
            color={p.bgA}
            weight={700}
            fontFamily={t.fontFamily}
            letterSpacing={1.0}
            textTransform="uppercase"
            textShadow={`${Math.max(0.4, sc*0.18)}px ${Math.max(0.4, sc*0.18)}px 0 ${p.neonA}`}
          />

          {/* Field tags — light panels with dark text + neon left rules */}
          <div className="flex flex-col" style={{ gap: ff * 0.28 }}>
            <NeonTag label="SUBJECT" value={s.subject} f={ff} text={p.bgA} accent={p.neonA} bg="rgba(0,0,0,0.04)" fm={t.fontFamily} flex={1} />
            <div className="flex" style={{ gap: ff * 0.35 }}>
              <NeonTag label="CLASS" value={s.className} f={ff} text={p.bgA} accent={p.neonA} bg="rgba(0,0,0,0.04)" fm={t.fontFamily} flex={1} />
              <NeonTag label="DIV"   value={s.division}  f={ff} text={p.bgA} accent={p.neonA} bg="rgba(0,0,0,0.04)" fm={t.fontFamily} flex={0.7} />
              <NeonTag label="ROLL"  value={s.rollNo}    f={ff} text={p.bgA} accent={p.neonA} bg="rgba(0,0,0,0.04)" fm={t.fontFamily} flex={1} />
            </div>

            <div>
              <span style={{
                display: "block",
                fontFamily: t.fontFamily,
                fontSize: ff * 0.78,
                fontWeight: 700,
                color: p.neonB,
                letterSpacing: Math.max(0.5, sc*0.16),
                textTransform: "uppercase" as const,
                whiteSpace: "nowrap" as const,
                overflow: "hidden",
                textOverflow: "ellipsis" as const,
                maxWidth: "100%",
              }}>
                ▸ {(s.schoolName || "School").slice(0, 30)}
              </span>
            </div>
          </div>
        </WriteCard>
      </div>

      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/** Neon tag chip used by the Anime Neon Card template. */
/* ============================================================
   T9: SPACE — cosmic deep-space card with starfield, nebula
   gradient, ringed-planet photo frame, constellation accents,
   shooting-star school banner. Long-name capable via SmartName.
   ============================================================ */
function T9_Space({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(4, sc*1.4);
  const pad=Math.max(3, h*0.06);

  // Five cosmic palettes — each copy rotates so a class set looks like a galaxy roster.
  const palettes = [
    { name: "Nebula",  bgA: "#0b0418", bgB: "#2a0a4a", neb1: "rgba(168,85,247,0.45)", neb2: "rgba(236,72,153,0.30)", accent: "#c084fc", glow: "rgba(192,132,252,0.55)", text: "#f3e8ff", planet: "linear-gradient(135deg,#a855f7,#ec4899)", ring: "rgba(244,114,182,0.7)" },
    { name: "Andromeda", bgA: "#020617", bgB: "#0c2a4a", neb1: "rgba(56,189,248,0.40)", neb2: "rgba(99,102,241,0.30)", accent: "#38bdf8", glow: "rgba(56,189,248,0.55)", text: "#e0f2fe", planet: "linear-gradient(135deg,#38bdf8,#6366f1)", ring: "rgba(96,165,250,0.7)" },
    { name: "Solar",   bgA: "#1c0a03", bgB: "#3a1206", neb1: "rgba(251,146,60,0.50)", neb2: "rgba(239,68,68,0.30)", accent: "#fb923c", glow: "rgba(251,146,60,0.55)", text: "#fff1e0", planet: "linear-gradient(135deg,#fbbf24,#ef4444)", ring: "rgba(252,211,77,0.7)" },
    { name: "Aurora",  bgA: "#031613", bgB: "#0a3a2c", neb1: "rgba(52,211,153,0.45)", neb2: "rgba(16,185,129,0.25)", accent: "#34d399", glow: "rgba(52,211,153,0.55)", text: "#ecfdf5", planet: "linear-gradient(135deg,#10b981,#06b6d4)", ring: "rgba(110,231,183,0.7)" },
    { name: "Starlight", bgA: "#040b1f", bgB: "#0f1e3f", neb1: "rgba(125,211,252,0.35)", neb2: "rgba(217,70,239,0.30)", accent: "#a5b4fc", glow: "rgba(165,180,252,0.55)", text: "#e0e7ff", planet: "linear-gradient(135deg,#818cf8,#22d3ee)", ring: "rgba(199,210,254,0.7)" },
  ];
  const seed = (ci + ((s.name||"a").charCodeAt(0))) % palettes.length;
  const p = palettes[seed];

  // Photo geometry — circular "planet" on the left
  const ps = Math.min(w*0.34, h*0.82);
  const photoCx = w*0.22, photoCy = h*0.45;
  const photoR = ps/2;

  // Text column
  const txtLeft = photoCx + photoR + pad*1.0;
  const txtRight = pad*0.8;
  const nameBoxW = w - txtLeft - txtRight;
  const NAME_TOP = pad*0.5;
  const NAME_BOTTOM = h*0.52;
  const nameBoxH = NAME_BOTTOM - NAME_TOP;

  // Bottom "shooting-star" banner zone
  const STRIPE_TOP = h*0.78;
  const STRIPE_H = h - STRIPE_TOP;
  const sf = Math.max(5, STRIPE_H*0.42);
  const ff = Math.max(5, h*0.085);
  const ink = Math.max(0.8, sc*0.35);

  // Deterministic pseudo-random for star positions (same seed = same star pattern per slip).
  const rand = (n: number) => { const x = Math.sin(n * 9301 + seed * 49297) * 233280; return x - Math.floor(x); };

  // Star field — 60 stars of varying brightness. Avoid drawing inside the planet region.
  const stars = Array.from({ length: 60 }, (_, i) => {
    let sx = rand(i*2) * w;
    let sy = rand(i*2+1) * h;
    // Push stars away from the planet so the photo reads cleanly.
    const dx = sx - photoCx, dy = sy - photoCy;
    if (Math.sqrt(dx*dx + dy*dy) < photoR + sc*1.8) {
      const ang = Math.atan2(dy, dx) || 0;
      const dist = photoR + sc*2 + rand(i*3) * sc*4;
      sx = photoCx + Math.cos(ang) * dist;
      sy = photoCy + Math.sin(ang) * dist;
    }
    const sz = rand(i*5) * sc*0.6 + sc*0.18;
    const op = 0.4 + rand(i*7) * 0.6;
    return { x: sx, y: sy, r: sz, op, twinkle: i % 7 === 0 };
  });

  // Big "shooting star" trail across the upper-right quadrant
  const shootStart = { x: w*0.55, y: h*0.06 };
  const shootEnd = { x: w*0.92, y: h*0.32 };

  // Constellation: connect 5 specific stars with thin lines to suggest a constellation
  const cons = [
    { x: w*0.55, y: h*0.18 },
    { x: w*0.62, y: h*0.30 },
    { x: w*0.72, y: h*0.22 },
    { x: w*0.80, y: h*0.36 },
    { x: w*0.86, y: h*0.20 },
  ];

  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: `linear-gradient(135deg, ${p.bgA}, ${p.bgB})`, boxShadow: "0 2px 12px rgba(0,0,0,0.45)", fontFamily: t.fontFamily, color: p.text }}>

      <svg className="absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ zIndex: 0 }}>
        <defs>
          {/* Two soft nebula clouds — radial gradients with off-center origins */}
          <radialGradient id={`neb1-${seed}`} cx="0.18" cy="0.7" r="0.6">
            <stop offset="0" stopColor={p.neb1} stopOpacity="1" />
            <stop offset="1" stopColor={p.neb1} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`neb2-${seed}`} cx="0.85" cy="0.25" r="0.55">
            <stop offset="0" stopColor={p.neb2} stopOpacity="1" />
            <stop offset="1" stopColor={p.neb2} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`planet-${seed}`} cx="0.35" cy="0.35" r="0.7">
            <stop offset="0" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="0.4" stopColor="rgba(255,255,255,0.0)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.35)" />
          </radialGradient>
          <linearGradient id={`shoot-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={p.accent} stopOpacity="0" />
            <stop offset="0.7" stopColor={p.accent} stopOpacity="0.8" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`band-${seed}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={p.bgA} stopOpacity="0.92" />
            <stop offset="0.5" stopColor={p.bgA} stopOpacity="0.78" />
            <stop offset="1" stopColor={p.accent} stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Nebula clouds */}
        <rect x="0" y="0" width={w} height={h} fill={`url(#neb1-${seed})`} />
        <rect x="0" y="0" width={w} height={h} fill={`url(#neb2-${seed})`} />

        {/* Star field */}
        {stars.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r}
            fill={st.twinkle ? p.accent : "#ffffff"}
            opacity={st.op} />
        ))}

        {/* Plus-shaped sparkles for the 4 brightest twinkle stars */}
        {stars.filter(s => s.twinkle).slice(0, 4).map((st, i) => {
          const arm = st.r * 4;
          return (
            <g key={`spk-${i}`} opacity={st.op}>
              <line x1={st.x - arm} y1={st.y} x2={st.x + arm} y2={st.y} stroke={p.accent} strokeWidth={Math.max(0.3, sc*0.12)} strokeLinecap="round" />
              <line x1={st.x} y1={st.y - arm} x2={st.x} y2={st.y + arm} stroke={p.accent} strokeWidth={Math.max(0.3, sc*0.12)} strokeLinecap="round" />
            </g>
          );
        })}

        {/* Constellation lines + nodes (right side of card) */}
        {cons.slice(0, -1).map((pt, i) => (
          <line key={`c-${i}`} x1={pt.x} y1={pt.y} x2={cons[i+1].x} y2={cons[i+1].y}
            stroke={p.accent} strokeWidth={Math.max(0.3, sc*0.13)} opacity="0.5" />
        ))}
        {cons.map((pt, i) => (
          <circle key={`cn-${i}`} cx={pt.x} cy={pt.y} r={Math.max(0.7, sc*0.4)} fill={p.accent} opacity="0.85" />
        ))}

        {/* Shooting star trail */}
        <line x1={shootStart.x} y1={shootStart.y} x2={shootEnd.x} y2={shootEnd.y}
          stroke={`url(#shoot-${seed})`} strokeWidth={Math.max(0.6, sc*0.25)} strokeLinecap="round" />
        <circle cx={shootEnd.x} cy={shootEnd.y} r={Math.max(1, sc*0.5)} fill="#fff" />
        <circle cx={shootEnd.x} cy={shootEnd.y} r={Math.max(2, sc*1.0)} fill={p.glow} opacity="0.6" />

        {/* Saturn-style ring around the photo (drawn before photo, tilted ellipse) */}
        <g transform={`rotate(-22 ${photoCx} ${photoCy})`}>
          <ellipse cx={photoCx} cy={photoCy} rx={photoR + sc*4} ry={photoR*0.42}
            fill="none" stroke={p.ring} strokeWidth={Math.max(1, sc*0.45)} opacity="0.85" />
          <ellipse cx={photoCx} cy={photoCy} rx={photoR + sc*5.5} ry={photoR*0.55}
            fill="none" stroke={p.ring} strokeWidth={Math.max(0.6, sc*0.22)} opacity="0.55" />
        </g>

        {/* Outer glow halo behind the planet */}
        <circle cx={photoCx} cy={photoCy} r={photoR + sc*2.2} fill={p.glow} opacity="0.4" />
        <circle cx={photoCx} cy={photoCy} r={photoR + sc*1.0} fill={p.accent} opacity="0.55" />

        {/* Bottom shooting-star banner band */}
        <rect x="0" y={STRIPE_TOP} width={w} height={STRIPE_H} fill={`url(#band-${seed})`} />
        <line x1="0" y1={STRIPE_TOP} x2={w} y2={STRIPE_TOP}
          stroke={p.accent} strokeWidth={Math.max(0.6, sc*0.25)} opacity="0.85" />

        {/* Outer card border (thin, accent-tinted) */}
        <rect x={ink*0.6} y={ink*0.6} width={w - ink*1.2} height={h - ink*1.2} rx={r} ry={r}
          fill="none" stroke={p.accent} strokeWidth={Math.max(0.8, sc*0.35)} opacity="0.7" />
      </svg>

      {/* Photo — circular, with subtle planet shading overlay */}
      <div className="absolute" style={{
        left: photoCx - photoR, top: photoCy - photoR, width: ps, height: ps,
        borderRadius: "50%", overflow: "hidden",
        boxShadow: `0 0 ${sc*4}px ${p.glow}, inset 0 0 0 ${Math.max(0.8, sc*0.3)}px rgba(255,255,255,0.25)`,
        zIndex: 2, background: p.bgA,
      }}>
        {(s.aiImageUrl || s.imageUrl)
          ? <img src={s.aiImageUrl || s.imageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : (
            <div style={{ width: "100%", height: "100%", background: p.planet, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User style={{ width: "40%", height: "40%", color: "#fff", opacity: 0.5 }} />
            </div>
          )}
        {/* Planet light-side / dark-side gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(0,0,0,0.45) 100%)` }} />
      </div>

      {/* TEXT COLUMN — white writing card on the cosmic backdrop */}
      <div className="absolute" style={{
        left: txtLeft, right: txtRight,
        top: NAME_TOP, height: STRIPE_TOP - NAME_TOP - pad*0.4,
        zIndex: 3,
      }}>
        <WriteCard accent={p.accent} dark={p.bgA} sc={sc} padX={pad*0.5} padY={pad*0.35}>
          <SmartName
            text={s.name}
            boxWidth={nameBoxW - pad}
            boxHeight={nameBoxH - pad*0.4}
            color={p.bgA}
            weight={700}
            fontFamily={t.fontFamily}
            letterSpacing={0.6}
            textShadow={`${Math.max(0.4, sc*0.18)}px ${Math.max(0.4, sc*0.18)}px 0 ${p.accent}33`}
          />

          {/* Field tags — light panels with dark text + accent left rules */}
          <div className="flex flex-col" style={{ gap: ff*0.28 }}>
            <SpaceTag label="SUBJECT" value={s.subject} f={ff} text={p.bgA} accent={p.accent} fm={t.fontFamily} flex={1} />
            <div className="flex" style={{ gap: ff*0.35 }}>
              <SpaceTag label="CLASS" value={s.className} f={ff} text={p.bgA} accent={p.accent} fm={t.fontFamily} flex={1} />
              <SpaceTag label="DIV"   value={s.division}  f={ff} text={p.bgA} accent={p.accent} fm={t.fontFamily} flex={0.7} />
              <SpaceTag label="ROLL"  value={s.rollNo}    f={ff} text={p.bgA} accent={p.accent} fm={t.fontFamily} flex={1} />
            </div>
          </div>
        </WriteCard>
      </div>

      {/* SCHOOL NAME — bottom band, centered, no rotation */}
      <div className="absolute flex items-center justify-center" style={{
        left: pad, right: pad, top: STRIPE_TOP, height: STRIPE_H,
        zIndex: 4, pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: t.fontFamily,
          fontSize: sf,
          fontWeight: 700,
          color: p.text,
          letterSpacing: Math.max(1, sc*0.4),
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap" as const,
          overflow: "hidden", textOverflow: "ellipsis" as const,
          maxWidth: "100%",
          textShadow: `0 0 ${Math.max(1.4, sc*0.5)}px ${p.glow}`,
        }}>
          ✦ {(s.schoolName || "School").slice(0, 28)} ✦
        </span>
      </div>

      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/** Field tag for the Space template — works on both dark backdrop and white WriteCard. */
function SpaceTag({ label, value, f, text, accent, fm, flex }: { label: string; value: string; f: number; text: string; accent: string; fm?: string; flex: number }) {
  const str = (value || " ").trim();
  const len = Math.max(3, str.length);
  const valScale = len > 9 ? Math.max(0.5, 9 / len) : 1;
  return (
    <div style={{
      flex,
      minWidth: 0,
      background: `${accent}10`,
      border: `${Math.max(0.4, f*0.06)}px solid ${accent}55`,
      borderLeft: `${Math.max(0.8, f*0.12)}px solid ${accent}`,
      borderRadius: Math.max(1, f*0.18),
      padding: `${f*0.12}px ${f*0.32}px`,
      display: "flex",
      alignItems: "baseline",
      gap: f*0.28,
      fontFamily: fm,
    }}>
      <span style={{ fontSize: f*0.7, fontWeight: 700, color: accent, letterSpacing: 0.5, whiteSpace: "nowrap" as const }}>{label}</span>
      <span style={{
        flex: 1,
        fontSize: f * valScale,
        fontWeight: 600,
        color: value ? text : "transparent",
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis" as const,
      }}>{value || "."}</span>
    </div>
  );
}

/* ============================================================
   T10: FOOTBALL — sports-card style with stadium pitch lines,
   generic celebration silhouette, club-style color palettes,
   jersey-number badge, captain armband stripe, trophy accent.
   No real player likenesses (legal); pure iconography.
   ============================================================ */
function T10_Football({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(4, sc*1.4);
  const pad=Math.max(3, h*0.06);

  // Five "team-feel" palettes — generic, not naming any club.
  const palettes = [
    { name: "Red Devils", primary: "#dc2626", dark: "#1a0606", accent: "#fbbf24", text: "#fff5f5", grass: "#0d4d20", grassDark: "#062012" },
    { name: "Sky Blues",  primary: "#0ea5e9", dark: "#06233a", accent: "#f59e0b", text: "#e0f2fe", grass: "#0d6034", grassDark: "#082a17" },
    { name: "Submarine",  primary: "#facc15", dark: "#1a1505", accent: "#1e3a8a", text: "#fffbeb", grass: "#1a5f30", grassDark: "#0a2a18" },
    { name: "La Roja",    primary: "#b91c1c", dark: "#220505", accent: "#facc15", text: "#fff5f5", grass: "#13522a", grassDark: "#06210e" },
    { name: "Verde",      primary: "#15803d", dark: "#0a1f10", accent: "#fde047", text: "#dcfce7", grass: "#1f6b3a", grassDark: "#0a2818" },
  ];
  const seed = (ci + ((s.name||"a").charCodeAt(0))) % palettes.length;
  const p = palettes[seed];

  // Photo geometry — left circle (player headshot), framed in jersey colors.
  const ps = Math.min(w*0.32, h*0.78);
  const photoCx = w*0.21, photoCy = h*0.42;
  const photoR = ps/2;

  // Text column
  const txtLeft = photoCx + photoR + pad*1.0;
  const txtRight = pad*0.7;
  const nameBoxW = w - txtLeft - txtRight;
  const NAME_TOP = pad*0.4;
  const NAME_BOTTOM = h*0.46;
  const nameBoxH = NAME_BOTTOM - NAME_TOP;

  // Bottom "stadium pitch + scoreboard" stripe
  const STRIPE_TOP = h*0.74;
  const STRIPE_H = h - STRIPE_TOP;
  const ff = Math.max(5, h*0.085);
  const sf = Math.max(5, STRIPE_H*0.42);
  const ink = Math.max(0.8, sc*0.35);

  // Deterministic "jersey number" derived from name + copy index — feels personal without a real input field.
  const jerseyNum = (((s.name || "X").charCodeAt(0) * 7 + ((s.name || "X").charCodeAt(1) || 0) * 3 + ci) % 99) + 1;

  // Football icon helper — simple stylized ball with hex panels
  const ball = (cx: number, cy: number, rad: number) => (
    <g>
      <circle cx={cx} cy={cy} r={rad} fill="#fff" stroke={p.dark} strokeWidth={Math.max(0.5, sc*0.2)} />
      <polygon points={(() => { const pts: string[] = []; for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; pts.push(`${cx + Math.cos(a) * rad * 0.4},${cy + Math.sin(a) * rad * 0.4}`); } return pts.join(" "); })()} fill={p.dark} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a) * rad * 0.4, y1 = cy + Math.sin(a) * rad * 0.4;
        const x2 = cx + Math.cos(a) * rad, y2 = cy + Math.sin(a) * rad;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={p.dark} strokeWidth={Math.max(0.3, sc*0.13)} />;
      })}
    </g>
  );

  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: p.dark, boxShadow: "0 2px 12px rgba(0,0,0,0.35)", fontFamily: t.fontFamily, color: p.text }}>

      <svg className="absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ zIndex: 0 }}>
        <defs>
          {/* Stadium spotlight gradient */}
          <radialGradient id={`spot-${seed}`} cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          {/* Diagonal team-color band gradient */}
          <linearGradient id={`band-${seed}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={p.primary} />
            <stop offset="1" stopColor={p.dark} />
          </linearGradient>
          {/* Pitch grass — alternating mowing stripes via two stops */}
          <linearGradient id={`grass-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.grass} />
            <stop offset="1" stopColor={p.grassDark} />
          </linearGradient>
        </defs>

        {/* Top diagonal team-color band (jersey-style chevron) */}
        <polygon points={`0,0 ${w*0.65},0 ${w*0.45},${h*0.55} 0,${h*0.55}`} fill={`url(#band-${seed})`} />
        <polygon points={`${w*0.65},0 ${w},0 ${w},${h*0.55} ${w*0.45},${h*0.55}`} fill={p.dark} />

        {/* Diagonal accent stripe along the chevron edge */}
        <polygon points={`${w*0.65},0 ${w*0.66},0 ${w*0.46},${h*0.55} ${w*0.45},${h*0.55}`} fill={p.accent} />

        {/* Stadium spotlight wash */}
        <rect width={w} height={h*0.7} fill={`url(#spot-${seed})`} />

        {/* Pitch grass at bottom with mowing stripes */}
        <rect x="0" y={STRIPE_TOP} width={w} height={STRIPE_H} fill={`url(#grass-${seed})`} />
        {/* Mowing stripes — alternating darker bands */}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={`mow-${i}`} x={(i / 6) * w} y={STRIPE_TOP} width={w / 12} height={STRIPE_H}
            fill={p.grassDark} opacity="0.25" />
        ))}

        {/* Pitch lines: center circle + halfway line on the bottom stripe */}
        <line x1={w*0.5} y1={STRIPE_TOP} x2={w*0.5} y2={h} stroke="#fff" strokeWidth={Math.max(0.4, sc*0.18)} opacity="0.55" />
        <circle cx={w*0.5} cy={STRIPE_TOP + STRIPE_H*0.5} r={STRIPE_H*0.4} fill="none" stroke="#fff" strokeWidth={Math.max(0.4, sc*0.18)} opacity="0.55" />
        <circle cx={w*0.5} cy={STRIPE_TOP + STRIPE_H*0.5} r={Math.max(0.6, sc*0.3)} fill="#fff" opacity="0.55" />

        {/* Top edge of pitch — bright line */}
        <line x1="0" y1={STRIPE_TOP} x2={w} y2={STRIPE_TOP} stroke={p.accent} strokeWidth={Math.max(0.6, sc*0.25)} />
        <line x1="0" y1={STRIPE_TOP + Math.max(1.2, sc*0.5)} x2={w} y2={STRIPE_TOP + Math.max(1.2, sc*0.5)} stroke="#fff" strokeWidth={Math.max(0.3, sc*0.12)} opacity="0.6" />

        {/* Player celebration silhouette in the upper-right (generic, no real likeness) */}
        <g transform={`translate(${w*0.7}, ${h*0.05}) scale(${sc*0.07})`} opacity="0.42">
          {/* Stylized arms-up celebration silhouette — abstract, not a specific player */}
          <path
            d={`
              M 50 110
              C 45 110, 40 105, 40 95
              L 38 70
              L 25 50
              L 18 30
              L 12 12
              L 18 8
              L 28 25
              L 38 42
              L 38 22
              C 38 12, 42 6, 50 6
              C 58 6, 62 12, 62 22
              L 62 42
              L 72 25
              L 82 8
              L 88 12
              L 82 30
              L 75 50
              L 62 70
              L 60 95
              C 60 105, 55 110, 50 110
              Z
            `}
            fill={p.dark} stroke={p.dark} strokeWidth="1"
          />
          {/* Head */}
          <circle cx="50" cy="-4" r="9" fill={p.dark} />
        </g>

        {/* Football (ball) — rolling on the pitch */}
        {ball(w*0.18, STRIPE_TOP + STRIPE_H*0.5, Math.max(2.2, sc*1.2))}

        {/* Trophy icon top-right (generic cup silhouette) */}
        <g transform={`translate(${w - pad*2.2}, ${pad*0.5})`} opacity="0.85">
          <path d={`M 0 ${sc*1.5} L 0 0 L ${sc*3} 0 L ${sc*3} ${sc*1.5} C ${sc*3} ${sc*3.2}, ${sc*2} ${sc*3.5}, ${sc*1.5} ${sc*3.5} C ${sc*1} ${sc*3.5}, 0 ${sc*3.2}, 0 ${sc*1.5} Z`} fill={p.accent} stroke={p.dark} strokeWidth={Math.max(0.3, sc*0.12)} />
          <rect x={sc*1.1} y={sc*3.4} width={sc*0.8} height={sc*0.8} fill={p.accent} />
          <rect x={sc*0.5} y={sc*4.0} width={sc*2} height={sc*0.5} fill={p.accent} stroke={p.dark} strokeWidth={Math.max(0.3, sc*0.12)} />
          {/* trophy handles */}
          <path d={`M 0 ${sc*0.5} C ${-sc*1} ${sc*0.5}, ${-sc*1} ${sc*2}, 0 ${sc*2}`} fill="none" stroke={p.accent} strokeWidth={Math.max(0.4, sc*0.18)} />
          <path d={`M ${sc*3} ${sc*0.5} C ${sc*4} ${sc*0.5}, ${sc*4} ${sc*2}, ${sc*3} ${sc*2}`} fill="none" stroke={p.accent} strokeWidth={Math.max(0.4, sc*0.18)} />
        </g>

        {/* Photo halo + outer ring (kit colors) */}
        <circle cx={photoCx} cy={photoCy} r={photoR + sc*1.6} fill={p.accent} />
        <circle cx={photoCx} cy={photoCy} r={photoR + sc*0.7} fill={p.dark} />

        {/* Captain's armband — small stripe across top of photo */}
        <rect x={photoCx - photoR*0.35} y={photoCy - photoR - sc*0.3} width={photoR*0.7} height={Math.max(1.2, sc*0.55)} fill={p.accent} stroke={p.dark} strokeWidth={Math.max(0.3, sc*0.12)} />
        <text x={photoCx} y={photoCy - photoR + sc*0.1} textAnchor="middle"
          fontFamily={t.fontFamily} fontSize={Math.max(3, sc*1.0)} fontWeight="700"
          fill={p.dark} letterSpacing="0.5">C</text>

        {/* Outer card border */}
        <rect x={ink*0.6} y={ink*0.6} width={w - ink*1.2} height={h - ink*1.2} rx={r} ry={r}
          fill="none" stroke={p.accent} strokeWidth={Math.max(0.8, sc*0.35)} opacity="0.7" />
      </svg>

      {/* Photo — circular, kit-colored ring already drawn in SVG behind */}
      <div className="absolute" style={{
        left: photoCx - photoR, top: photoCy - photoR, width: ps, height: ps,
        borderRadius: "50%", overflow: "hidden",
        boxShadow: `inset 0 0 0 ${Math.max(0.8, sc*0.3)}px rgba(255,255,255,0.25)`,
        background: p.dark,
        zIndex: 2,
      }}>
        {(s.aiImageUrl || s.imageUrl)
          ? <img src={s.aiImageUrl || s.imageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : (
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${p.primary}, ${p.dark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User style={{ width: "40%", height: "40%", color: "#fff", opacity: 0.5 }} />
            </div>
          )}
      </div>

      {/* Jersey-number badge — bottom-right corner of photo */}
      <div className="absolute" style={{
        left: photoCx + photoR*0.55, top: photoCy + photoR*0.45,
        width: photoR*0.9, height: photoR*0.9,
        borderRadius: "50%",
        background: p.accent,
        border: `${Math.max(1, sc*0.4)}px solid ${p.dark}`,
        boxShadow: `0 ${Math.max(1, sc*0.4)}px ${Math.max(2, sc*0.8)}px rgba(0,0,0,0.5)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 3,
        fontFamily: t.fontFamily,
        fontSize: photoR * 0.55,
        fontWeight: 700,
        color: p.dark,
        letterSpacing: -0.5,
      }}>
        {jerseyNum}
      </div>

      {/* TEXT COLUMN — white writing card on the kit-colored backdrop */}
      <div className="absolute" style={{
        left: txtLeft, right: txtRight,
        top: NAME_TOP, height: STRIPE_TOP - NAME_TOP - pad*0.4,
        zIndex: 3,
      }}>
        <WriteCard accent={p.accent} dark={p.dark} sc={sc} padX={pad*0.5} padY={pad*0.35}>
          <SmartName
            text={s.name}
            boxWidth={nameBoxW - pad}
            boxHeight={nameBoxH - pad*0.4}
            color={p.dark}
            weight={700}
            fontFamily={t.fontFamily}
            letterSpacing={1.0}
            textTransform="uppercase"
            textShadow={`${Math.max(0.4, sc*0.18)}px ${Math.max(0.4, sc*0.18)}px 0 ${p.primary}55`}
          />

          <div className="flex flex-col" style={{ gap: ff*0.28 }}>
            <FootballStat label="POSITION" value={s.subject} f={ff} text={p.dark} accent={p.primary} primary={p.primary} fm={t.fontFamily} flex={1} />
            <div className="flex" style={{ gap: ff*0.35 }}>
              <FootballStat label="CLASS" value={s.className} f={ff} text={p.dark} accent={p.primary} primary={p.primary} fm={t.fontFamily} flex={1} />
              <FootballStat label="DIV"   value={s.division}  f={ff} text={p.dark} accent={p.primary} primary={p.primary} fm={t.fontFamily} flex={0.7} />
              <FootballStat label="ROLL"  value={s.rollNo}    f={ff} text={p.dark} accent={p.primary} primary={p.primary} fm={t.fontFamily} flex={1} />
            </div>
          </div>
        </WriteCard>
      </div>

      {/* SCHOOL NAME — scoreboard banner on the pitch */}
      <div className="absolute flex items-center justify-center" style={{
        left: pad, right: pad, top: STRIPE_TOP, height: STRIPE_H,
        zIndex: 4, pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: t.fontFamily,
          fontSize: sf,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 1.6,
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap" as const,
          overflow: "hidden", textOverflow: "ellipsis" as const,
          maxWidth: "100%",
          textShadow: `${Math.max(0.6, sc*0.22)}px ${Math.max(0.6, sc*0.22)}px 0 ${p.dark}, 0 0 ${Math.max(2, sc*0.8)}px rgba(0,0,0,0.6)`,
        }}>
          ⚽ {(s.schoolName || "Football Club").slice(0, 28)} ⚽
        </span>
      </div>

      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/** Stats-line field row used by the Football template — angled jersey-tag look. */
function FootballStat({ label, value, f, text, accent, primary, fm, flex }: { label: string; value: string; f: number; text: string; accent: string; primary: string; fm?: string; flex: number }) {
  const str = (value || " ").trim();
  const len = Math.max(3, str.length);
  const valScale = len > 9 ? Math.max(0.5, 9 / len) : 1;
  return (
    <div style={{
      flex,
      minWidth: 0,
      background: `${accent}10`,
      borderLeft: `${Math.max(1, f*0.15)}px solid ${accent}`,
      borderRight: `${Math.max(0.4, f*0.05)}px solid ${primary}55`,
      borderRadius: Math.max(1, f*0.12),
      padding: `${f*0.12}px ${f*0.32}px`,
      display: "flex",
      alignItems: "baseline",
      gap: f*0.28,
      fontFamily: fm,
    }}>
      <span style={{ fontSize: f*0.7, fontWeight: 700, color: accent, letterSpacing: 0.6, whiteSpace: "nowrap" as const }}>{label}</span>
      <span style={{
        flex: 1,
        fontSize: f * valScale,
        fontWeight: 700,
        color: value ? text : "transparent",
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis" as const,
      }}>{value || "."}</span>
    </div>
  );
}

/* ============================================================
   T11: RETRO WINDOWS 🌐 (Windows 95 desktop window aesthetic)
   Grey OS chrome, blue title bar with min/max/close, menu bar,
   sunken bevel form fields, status bar — every Student field
   is displayed. Long names handled by SmartName, the rest
   shrink by character count.
   ============================================================ */
function T11_RetroY2K({ s, t, sc, wm }: SP) {
  const w=t.width*sc, h=t.height*sc;

  // Windows 95 grey palette
  const GREY      = "#c0c0c0";  // 3D face
  const GREY_DARK = "#808080";  // shadow
  const WHITE_HL  = "#ffffff";  // highlight
  const BLACK     = "#000000";
  const TITLE_BG  = "#000080";  // classic Windows blue
  const TITLE_FG  = "#ffffff";
  const TEXT      = "#000000";
  const LINK_BLUE = "#0000ff";

  // Bevel thickness scales with the slip size so borders read at print size
  // instead of vanishing on a 90mm card. Win95 used 2px bevels in 1×; we use
  // a sc-derived value so the look stays consistent at any export DPI.
  const B = Math.max(1.5, sc * 0.55);
  const raised =
    `inset ${B}px ${B}px 0 ${WHITE_HL},` +
    `inset -${B}px -${B}px 0 ${GREY_DARK},` +
    `inset ${B*2}px ${B*2}px 0 ${GREY},` +
    `inset -${B*2}px -${B*2}px 0 ${BLACK}`;
  const sunken =
    `inset ${B}px ${B}px 0 ${GREY_DARK},` +
    `inset -${B}px -${B}px 0 ${WHITE_HL},` +
    `inset ${B*2}px ${B*2}px 0 ${BLACK},` +
    `inset -${B*2}px -${B*2}px 0 ${GREY}`;

  // Size hooks — bumped from earlier so chrome reads at slip size
  const F      = "'MS Sans Serif', Tahoma, Geneva, Verdana, sans-serif";
  const titleH = Math.max(14, h * 0.13);
  const menuH  = Math.max(10, h * 0.09);
  const statusH = Math.max(9, h * 0.08);
  const pad    = Math.max(4, sc * 1.4);
  const f      = Math.max(6, h * 0.085);   // base form font size
  const sm     = Math.max(5, h * 0.062);   // small label
  const nameH  = Math.max(9, h * 0.19);    // big name display

  // Truncate window-title filename to avoid wrapping in the title bar
  const fileName = `${(s.name || "Untitled").slice(0, 24)}.idn`;

  return (
    <div className="relative overflow-hidden" style={{
      width: w, height: h, background: GREY, color: TEXT, fontFamily: F,
      boxShadow: raised, borderRadius: 0,
    }}>
      {/* ===== TITLE BAR ===== */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between"
        style={{
          height: titleH,
          background: `linear-gradient(90deg, ${TITLE_BG} 0%, #1084d0 100%)`,
          padding: `0 ${pad*0.6}px`,
          color: TITLE_FG,
        }}>
        <div className="flex items-center gap-1 min-w-0">
          {/* Tiny pixel "document" icon */}
          <svg width={titleH*0.7} height={titleH*0.7} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
            <rect x="2" y="1" width="10" height="14" fill="#fff" stroke="#000" strokeWidth="0.5" />
            <line x1="4" y1="4" x2="10" y2="4" stroke="#000" strokeWidth="0.5" />
            <line x1="4" y1="6" x2="10" y2="6" stroke="#000" strokeWidth="0.5" />
            <line x1="4" y1="8" x2="10" y2="8" stroke="#000" strokeWidth="0.5" />
            <line x1="4" y1="10" x2="8"  y2="10" stroke="#000" strokeWidth="0.5" />
          </svg>
          <span style={{
            fontSize: titleH*0.55, fontWeight: 700, letterSpacing: 0.3,
            whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {fileName} - Student Identity Slip
          </span>
        </div>
        {/* Min / Max / Close buttons */}
        <div className="flex items-center gap-0.5" style={{ flexShrink: 0 }}>
          <WinTitleBtn size={titleH*0.78} label="_" />
          <WinTitleBtn size={titleH*0.78} label="▢" />
          <WinTitleBtn size={titleH*0.78} label="✕" />
        </div>
      </div>

      {/* ===== MENU BAR ===== */}
      <div className="absolute left-0 right-0 flex items-center gap-3"
        style={{ top: titleH, height: menuH, background: GREY, padding: `0 ${pad*0.8}px`,
          borderBottom: `${B}px solid ${GREY_DARK}`, boxShadow: `inset 0 -${B}px 0 ${WHITE_HL}` }}>
        {["File", "Edit", "View", "Insert", "Help"].map((label) => (
          <span key={label} style={{ fontSize: menuH*0.7, fontWeight: 400, color: TEXT }}>
            <u>{label.charAt(0)}</u>{label.slice(1)}
          </span>
        ))}
      </div>

      {/* ===== CLIENT AREA ===== */}
      <div className="absolute flex gap-1"
        style={{
          top: titleH + menuH + pad*0.4,
          bottom: statusH + pad*0.4,
          left: pad*0.6, right: pad*0.6,
        }}>

        {/* LEFT COLUMN — photo well + class/div/roll */}
        <div className="flex flex-col gap-1" style={{ width: w*0.32 }}>
          {/* Photo "well" — sunken bevel like a Windows picture frame */}
          <div style={{
            width: "100%", aspectRatio: "1/1", background: WHITE_HL,
            boxShadow: sunken, overflow: "hidden", flexShrink: 0,
          }}>
            {(s.aiImageUrl || s.imageUrl) ? (
              <img src={s.aiImageUrl || s.imageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: WHITE_HL }}>
                <User style={{ width: "45%", height: "45%", color: GREY_DARK }} />
              </div>
            )}
          </div>

          {/* Std (className) / Div / Roll input row */}
          <WinInput label="Std"  value={s.className} f={sm} center />
          <div className="flex gap-1">
            <WinInput label="Div"  value={s.division} f={sm} flex={1} center />
            <WinInput label="Roll" value={s.rollNo}   f={sm} flex={1} center />
          </div>
        </div>

        {/* RIGHT COLUMN — name + school + subject + passion + checkbox row */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">

          {/* Big name display — sunken text field with bigger font; SmartName handles long names */}
          <div>
            <span style={{ fontSize: sm*0.85, fontWeight: 700, color: TEXT, display: "block", marginBottom: 1 }}>
              <u>N</u>ame:
            </span>
            <div style={{ background: WHITE_HL, boxShadow: sunken, padding: `${pad*0.2}px ${pad*0.4}px` }}>
              <SmartName
                text={s.name || "Untitled"}
                boxWidth={w*0.62}
                boxHeight={nameH}
                color={TEXT}
                weight={700}
                fontFamily={F}
                letterSpacing={0}
                textTransform="uppercase"
              />
            </div>
          </div>

          {/* School */}
          <WinInput label="School" value={s.schoolName || "(Unspecified)"} f={f*0.85} />

          {/* Subject / Specialization — highlighted with a "field group" frame */}
          <div style={{
            background: GREY, padding: `${pad*0.4}px ${pad*0.5}px`,
            boxShadow: raised,
          }}>
            <span style={{ fontSize: sm*0.85, fontWeight: 700, color: TEXT, display: "block", marginBottom: 2 }}>
              <u>S</u>ubject / Specialization:
            </span>
            <div style={{ background: WHITE_HL, boxShadow: sunken, padding: `${pad*0.2}px ${pad*0.4}px`,
              fontSize: f*1.05, fontWeight: 700, color: TEXT, whiteSpace: "nowrap" as const,
              overflow: "hidden", textOverflow: "ellipsis" as const,
            }}>
              {s.subject || "—"}
            </div>
          </div>

          {/* Passion + checkbox row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <WinInput
                label="Future Path"
                value={`${getPassionTheme(s.passion || "Other").icon} ${s.passion || "Undecided"}`}
                f={sm}
              />
            </div>
            <WinCheck label="Verified" checked={true} f={sm} />
          </div>
        </div>
      </div>

      {/* ===== STATUS BAR ===== */}
      <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between"
        style={{
          height: statusH, background: GREY, padding: `0 ${pad*0.6}px`,
          borderTop: `1px solid ${WHITE_HL}`,
          boxShadow: `inset 0 1px 0 ${GREY_DARK}`,
        }}>
        <span style={{ fontSize: statusH*0.65, color: TEXT, fontWeight: 400 }}>
          ID: <span style={{ color: LINK_BLUE, textDecoration: "underline" }}>#{(s.id || "00000000").slice(0,8).toUpperCase()}</span>
        </span>
        <span style={{ fontSize: statusH*0.65, color: TEXT }}>
          {s.aiProcessed ? "● AI Processed" : "○ Original"}
        </span>
        <span style={{ fontSize: statusH*0.65, color: TEXT, fontFamily: "monospace" }}>
          SlipGen v2.0
        </span>
      </div>

      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

/** Tiny Win95 title-bar control button (min / max / close). */
function WinTitleBtn({ size, label }: { size: number; label: string }) {
  return (
    <div style={{
      width: size, height: size,
      background: "#c0c0c0",
      boxShadow: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size*0.6, fontWeight: 900, color: "#000",
      fontFamily: "'MS Sans Serif', sans-serif",
    }}>{label}</div>
  );
}

function WizardInput({ label, value, f, flex, color, isBlank }: { label: string, value: string, f: number, flex?: number, color?: string, isBlank?: boolean }) {
  return (
    <div style={{ flex: flex || "none", display: "flex", flexDirection: "column", gap: 1 }}>
       <span style={{ fontSize: f*0.5, fontWeight: 700, color: "#000", letterSpacing: 0.5 }}>{label}:</span>
       <div style={{ 
         background: isBlank ? "rgba(0,0,0,0.02)" : "#fff", 
         border: "2px solid #808080", borderRightColor: "#fff", borderBottomColor: "#fff",
         padding: "2px 4px", fontSize: f, fontWeight: 700, color: color || "#333",
         minHeight: f * 1.3, display: "flex", alignItems: "center", overflow: "hidden"
       }}>
         {value || " "}
       </div>
    </div>
  );
}

function WinBtn({ children, f }: { children: React.ReactNode, f: number }) {
  return (
    <div style={{ 
      background: "#c0c0c0", padding: `1px 8px`, border: "1px solid #000",
      boxShadow: "inset 1px 1px 0 #fff", fontSize: f, fontWeight: 600, cursor: "pointer"
    }}>{children}</div>
  );
}

function WinInput({ label, value, f, flex, width, center }: { label: string, value: string, f: number, flex?: number, width?: number, center?: boolean }) {
  // Bevel thickness scales off font size so the sunken border stays visible
  // at any slip dimension. ~12% of font size is the Win95 visual ratio.
  const b = Math.max(0.8, f * 0.16);
  return (
    <div style={{ flex: flex || "none", width: width || "auto", display: "flex", flexDirection: "column", gap: f*0.1 }}>
       <span style={{ fontSize: f*0.78, fontWeight: 700, color: "#000", letterSpacing: 0.3 }}>{label}:</span>
       <div style={{
         background: "#fff",
         boxShadow:
           `inset ${b}px ${b}px 0 #808080, ` +
           `inset -${b}px -${b}px 0 #fff, ` +
           `inset ${b*2}px ${b*2}px 0 #000, ` +
           `inset -${b*2}px -${b*2}px 0 #c0c0c0`,
         padding: `${f*0.22}px ${f*0.45}px`,
         fontSize: f,
         fontWeight: 700,
         color: "#000",
         textAlign: center ? "center" : "left",
         whiteSpace: "nowrap" as const,
         overflow: "hidden",
         textOverflow: "ellipsis" as const,
         minHeight: f * 1.35,
         display: "flex", alignItems: "center", justifyContent: center ? "center" : "flex-start",
       }}>
         {value || ""}
       </div>
    </div>
  );
}

function WinCheck({ label, checked, f }: { label: string, checked: boolean, f: number }) {
  const b = Math.max(0.8, f * 0.18);
  return (
    <div className="flex items-center" style={{ gap: f*0.25 }}>
       <div style={{
         width: f*1.25, height: f*1.25,
         background: "#fff",
         boxShadow:
           `inset ${b}px ${b}px 0 #808080, ` +
           `inset -${b}px -${b}px 0 #fff, ` +
           `inset ${b*2}px ${b*2}px 0 #000, ` +
           `inset -${b*2}px -${b*2}px 0 #c0c0c0`,
         display: "flex", alignItems: "center", justifyContent: "center",
         fontSize: f*0.95, color: "#000", fontWeight: 900,
       }}>
         {checked ? "✓" : ""}
       </div>
       <span style={{ fontSize: f*0.85, fontWeight: 700, color: "#000" }}>{label}</span>
    </div>
  );
}


function WinButton({ children, sc, size, color }: { children: React.ReactNode, sc: number, size: number, color?: string }) {
  return (
    <div style={{ 
      width: size, height: size, 
      background: color || "#c0c0c0", 
      border: `1px solid #000`,
      boxShadow: `inset 1px 1px 0 #fff`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size*0.7, fontWeight: 900, color: "#000",
      cursor: "pointer"
    }}>{children}</div>
  );
}

function WinLink({ label, value, f }: { label: string, value: string, f: number }) {
  return (
    <div className="flex items-baseline gap-1 overflow-hidden">
      <span style={{ fontSize: f*0.8, fontWeight: 700, color: "#000" }}>{label}:</span>
      <span style={{ 
        fontSize: f, 
        color: "#0000ff", 
        textDecoration: "underline",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        flex: 1
      }}>{value || "None"}</span>
    </div>
  );
}

/* ============================================================
   T12: ANIME TRADING CARD 🃏 (Pokemon / Trading Card Game)
   5 Rarity Styles: Common, Rare, Super Rare, Ultra Rare, Secret Rare.
   Landscape-optimized: Photo on left, info on right.
   ============================================================ */
function T12_AnimeCard({ s, t, sc, wm, ci }: SP) {
  const w=t.width*sc, h=t.height*sc, r=Math.max(4, sc*1.5);
  
  // 5 Rarity Levels that rotate per copy
  const rarities = [
    { name: "COMMON", border: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%)", text: "#4b5563", star: "☆", glow: "rgba(0,0,0,0.1)" },
    { name: "RARE", border: "linear-gradient(135deg, #fbbf24 0%, #b45309 50%, #fbbf24 100%)", text: "#b45309", star: "★", glow: "rgba(251,191,36,0.3)" },
    { name: "SUPER RARE", border: "linear-gradient(135deg, #818cf8 0%, #4f46e5 50%, #818cf8 100%)", text: "#4338ca", star: "★★", glow: "rgba(99,102,241,0.4)" },
    { name: "ULTRA RARE", border: "linear-gradient(135deg, #f87171 0%, #b91c1c 50%, #f87171 100%)", text: "#991b1b", star: "★★★", glow: "rgba(239,68,68,0.5)" },
    { name: "SECRET RARE", border: "linear-gradient(135deg, #f472b6 0%, #db2777 33%, #9333ea 66%, #22d3ee 100%)", text: "#7e22ce", star: "★★★★", glow: "rgba(168,85,247,0.6)" },
  ];
  const rarity = rarities[ci % rarities.length];

  // Type themes based on Passion
  const themes: Record<string, { col: string, bg: string, icon: string, type: string }> = {
    Doctor:     { col: "#ef4444", bg: "#fee2e2", icon: "❤️", type: "HEALER" },
    Engineer:   { col: "#3b82f6", bg: "#dbeafe", icon: "⚡", type: "TECH" },
    Scientist:  { col: "#8b5cf6", bg: "#ede9fe", icon: "🧬", type: "MYSTIC" },
    Pilot:      { col: "#0ea5e9", bg: "#e0f2fe", icon: "🌪️", type: "AERO" },
    Artist:     { col: "#ec4899", bg: "#fce7f3", icon: "🎨", type: "CREATIVE" },
    Teacher:    { col: "#10b981", bg: "#dcfce7", icon: "📖", type: "WISDOM" },
    Athlete:    { col: "#f59e0b", bg: "#fef3c7", icon: "🔥", type: "POWER" },
    Astronaut:  { col: "#6366f1", bg: "#e0e7ff", icon: "🌌", type: "COSMIC" },
    Chef:       { col: "#f97316", bg: "#ffedd5", icon: "🍳", type: "FIRE" },
    Musician:   { col: "#d946ef", bg: "#fae8ff", icon: "🎵", type: "SONIC" },
    Other:      { col: "#6b7280", bg: "#f3f4f6", icon: "⭐", type: "BASIC" },
  };

  const theme = themes[s.passion] || themes.Other;
  const F = "var(--font-bebas), Impact, sans-serif";

  return (
    <div className="relative overflow-hidden" style={{ 
      width: w, height: h, borderRadius: r, 
      background: rarity.border, 
      padding: sc*1,
      boxShadow: `0 4px 15px ${rarity.glow}`,
      fontFamily: F
    }}>
      {/* Inner Card Frame */}
      <div className="relative w-full h-full flex overflow-hidden" style={{ 
        background: theme.bg,
        borderRadius: r*0.6,
        border: `${sc*0.4}px solid #444`,
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)"
      }}>
        {/* Left Column: Image & LV */}
        <div className="flex flex-col h-full" style={{ width: w*0.38, borderRight: `1px solid ${theme.col}33`, background: "rgba(0,0,0,0.02)" }}>
           <div style={{ 
             flex: 1,
             margin: sc*1.2,
             background: "#fff",
             border: `${sc*0.3}px solid ${ci % 2 === 0 ? "#daa520" : "#c0c0c0"}`,
             boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
             overflow: "hidden",
             display: "flex", alignItems: "center", justifyContent: "center"
           }}>
             {(s.aiImageUrl || s.imageUrl)
              ? <img src={s.aiImageUrl || s.imageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <User style={{ width: "40%", height: "40%", color: "#ddd" }} />}
           </div>
           <div className="flex items-center justify-between" style={{ padding: `0 ${sc*1.5}px`, marginBottom: sc*1 }}>
              <span style={{ fontSize: h*0.07, color: "#666" }}>LV. {((s.name.length * 7) % 90) + 10}</span>
              <span style={{ fontSize: h*0.12, color: theme.col }}>{theme.icon}</span>
           </div>
        </div>

        {/* Right Column: Info & Moves */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
           {/* Name Header */}
           <div style={{ padding: `${sc*0.4}px ${sc*1.2}px`, background: "rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <span style={{ fontSize: h*0.13, color: "#111", letterSpacing: 0.5 }}>{s.name.toUpperCase()}</span>
           </div>

           {/* Stats Chips */}
           <div className="flex flex-wrap gap-1" style={{ padding: sc*1 }}>
              <CardChip label="CLASS" value={s.className} col={theme.col} f={h*0.06} />
              <CardChip label="ROLL" value={s.rollNo} col={theme.col} f={h*0.06} isBlank={!s.rollNo} />
              <CardChip label="TYPE" value={theme.type} col={theme.col} f={h*0.06} />
           </div>

           {/* Ability Box */}
           <div style={{ 
             margin: `0 ${sc*1}px`, 
             flex: 1,
             background: "rgba(255,255,255,0.4)", 
             borderRadius: sc*0.5,
             padding: `${sc*0.4}px ${sc*0.8}px`,
             border: `1px dashed ${theme.col}44`,
             overflow: "hidden"
           }}>
              <div className="flex justify-between items-center" style={{ borderBottom: `1px solid ${theme.col}33`, marginBottom: 2 }}>
                 <span style={{ fontSize: h*0.08, color: "#222" }}>{theme.icon} {s.subject || "_________"}</span>
                 <span style={{ fontSize: h*0.1, color: "#222" }}>
                   {(() => {
                     const atkBase = (s.name.length * 17 + ci * 23) % 300 + 50;
                     return atkBase + (atkBase % 10 === 0 ? 500 : 0); // Occasional "Ultra" ATK
                   })()} ATK
                 </span>
              </div>
              <p style={{ 
                fontSize: h*0.05, 
                color: "#555", 
                fontFamily: "var(--font-outfit), sans-serif",
                lineHeight: 1.1,
                margin: 0
              }}>
                {(() => {
                  const descSeed = (s.name.length + ci + (s.passion.length)) % 10;
                  const descs = [
                    `A legendary ${theme.type} from ${s.schoolName}. Manifests incredible skill in ${s.subject || "learning"}.`,
                    `Known for unparalleled focus. A rising star in ${s.subject || "the field"} at ${s.schoolName}.`,
                    `The silent genius. Their potential in ${s.subject || "their studies"} is immeasurable and feared.`,
                    `A powerhouse of creativity. Dominating the ${s.subject || "curriculum"} with style and grace.`,
                    `The ultimate strategist. Bringing victory to ${s.schoolName} through mastery of ${s.subject || "tactics"}.`,
                    `Full of unyielding spirit. Never backing down from ${s.subject || "any"} challenges in their path.`,
                    `A gifted mind. Unlocking the secrets of ${s.subject || "the universe"} with absolute ease.`,
                    `The heart of the team. Inspiring everyone at ${s.schoolName} with ${s.subject || "talent"}.`,
                    `A tactical prodigy. Mastering the art of ${s.subject || "knowledge"} at incredible light speed.`,
                    `A force to be reckoned with. The absolute apex of ${s.subject || "student"} excellence.`
                  ];
                  return descs[descSeed];
                })()}
              </p>
           </div>

           {/* Footer */}
           <div className="flex justify-between items-center" style={{ padding: `${sc*0.4}px ${sc*1.2}px`, fontSize: h*0.04, color: "#777", background: "rgba(0,0,0,0.03)" }}>
              <span>© 2026 {s.schoolName.slice(0,25)}</span>
              <span style={{ fontWeight: 800, color: rarity.text }}>{ci+1}/10 {rarity.name} {rarity.star}</span>
           </div>
        </div>
      </div>

      <Wm w={w} h={h} wm={wm} />
    </div>
  );
}

function CardChip({ label, value, col, f, isBlank }: { label: string, value: string, col: string, f: number, isBlank?: boolean }) {
  return (
    <div style={{ 
      background: isBlank ? "transparent" : col, 
      color: isBlank ? col : "#fff", 
      padding: `2px 6px`, 
      border: isBlank ? `1px dashed ${col}` : "none",
      borderRadius: 3, 
      fontSize: f,
      display: "flex", gap: 4,
      boxShadow: isBlank ? "none" : "0 1px 2px rgba(0,0,0,0.1)"
    }}>
      <span style={{ opacity: 0.8, fontWeight: 500 }}>{label}:</span>
      <span style={{ fontWeight: 900 }}>{value || "___"}</span>
    </div>
  );
}




/** Y2K-style chip — pill button with glossy highlight, used by the Retro Internet template. */
function RetroChip({ label, value, f, ink, accent, accent2, fm, flex, dark }: { label: string; value: string; f: number; ink: string; accent: string; accent2: string; fm?: string; flex: number; dark?: boolean }) {
  const str = (value || " ").trim();
  const len = Math.max(3, str.length);
  const valScale = len > 9 ? Math.max(0.5, 9 / len) : 1;
  return (
    <div style={{
      flex,
      minWidth: 0,
      background: dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.78)",
      border: `${Math.max(0.5, f*0.08)}px solid ${accent}`,
      borderRadius: f * 0.9,
      padding: `${f*0.1}px ${f*0.4}px`,
      display: "flex",
      alignItems: "baseline",
      gap: f*0.25,
      fontFamily: fm,
      boxShadow: `inset 0 ${f*0.1}px ${f*0.2}px rgba(255,255,255,0.7), 0 ${f*0.06}px ${f*0.15}px ${accent2}55`,
    }}>
      <span style={{ fontSize: f*0.7, fontWeight: 700, color: accent, letterSpacing: 0.3, whiteSpace: "nowrap" as const }}>{label}</span>
      <span style={{
        flex: 1,
        fontSize: f * valScale,
        fontWeight: 700,
        color: value ? ink : "transparent",
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis" as const,
      }}>{value || "."}</span>
    </div>
  );
}

function NeonTag({ label, value, f, text, accent, bg, fm, flex }: { label: string; value: string; f: number; text: string; accent: string; bg: string; fm?: string; flex: number }) {
  const str = (value || " ").trim();
  const len = Math.max(3, str.length);
  const valScale = len > 9 ? Math.max(0.5, 9 / len) : 1;
  return (
    <div style={{
      flex,
      minWidth: 0,
      background: bg,
      border: `${Math.max(0.4, f*0.06)}px solid ${accent}`,
      borderRadius: Math.max(1, f*0.15),
      padding: `${f*0.12}px ${f*0.32}px`,
      display: "flex",
      alignItems: "baseline",
      gap: f*0.3,
      fontFamily: fm,
    }}>
      <span style={{ fontSize: f*0.7, fontWeight: 700, color: accent, letterSpacing: 0.6, whiteSpace: "nowrap" as const }}>{label}</span>
      <span style={{
        flex: 1,
        fontSize: f * valScale,
        fontWeight: 700,
        color: value ? text : "transparent",
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis" as const,
      }}>{value || "."}</span>
    </div>
  );
}

/**
 * WriteCard — white "writing area" frame used by dark-themed templates so the
 * name and field rows always sit on a high-contrast surface. Matches the look
 * of paper laid on top of the dark backdrop: soft shadow, thin colored border,
 * rounded corners, slight inner padding.
 */
function WriteCard({ accent, dark, sc, padX, padY, children }: { accent: string; dark: string; sc: number; padX: number; padY: number; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#ffffff",
      border: `${Math.max(0.6, sc*0.22)}px solid ${accent}`,
      boxShadow: `0 ${Math.max(1, sc*0.4)}px ${Math.max(2, sc*0.8)}px rgba(0,0,0,0.35), inset 0 0 0 ${Math.max(0.4, sc*0.15)}px ${dark}11`,
      borderRadius: Math.max(2, sc*0.7),
      padding: `${padY}px ${padX}px`,
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: padY,
    }}>{children}</div>
  );
}

function FieldRowAnime({ label, value, f, ink, accent, fm }: { label: string; value: string; f: number; ink: string; accent: string; fm?: string }) {
  const str = (value || " ").trim();
  const len = Math.max(3, str.length);
  const scale = len > 10 ? Math.max(0.45, 10 / len) : 1;
  return (
    <div className="flex items-center flex-1 min-w-0" style={{ gap: f*0.28, fontFamily: fm }}>
      {/* Chevron tag for the label — gives every row a "stat block" feel */}
      <span style={{
        fontSize: f*0.7, fontWeight: 700, color: "#fff", background: ink,
        padding: `${f*0.05}px ${f*0.4}px ${f*0.05}px ${f*0.3}px`,
        clipPath: "polygon(0% 0%, 100% 0%, 88% 50%, 100% 100%, 0% 100%)",
        letterSpacing: 0.6, whiteSpace: "nowrap" as const,
      }}>{label}</span>
      <span style={{
        flex: 1, fontSize: f * scale, fontWeight: 700,
        color: value ? ink : "transparent",
        whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
        borderBottom: `${Math.max(0.5, f*0.07)}px solid ${accent}`,
        paddingBottom: f * 0.08,
      }}>{value || "."}</span>
    </div>
  );
}

function DottedField({ l, v, f, lf, fm }: { l: string; v: string; f: number; lf: number; fm: string }) {
  const str = (v || " ").trim();
  const len = Math.max(3, str.length);
  const scale = len > 10 ? Math.max(0.45, 10 / len) : 1;
  return (
    <div className="flex items-baseline flex-1" style={{ gap: 2 }}>
      <span style={{ fontFamily: fm, fontSize: lf, fontWeight: 700, color: "#5a3e1b", whiteSpace: "nowrap" }}>{l}:</span>
      <span style={{ flex: 1, fontFamily: fm, fontSize: f * scale, fontWeight: v ? 600 : 400, color: v ? "#2d1810" : "transparent", borderBottom: "1px dotted #b8860b", paddingBottom: 1, paddingLeft: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v || "."}</span>
    </div>
  );
}

/* ====== Watermark ====== */
function Wm({ w, h, wm }: { w: number; h: number; wm: WatermarkConfig }) {
  if (!wm?.enabled) return null;
  const op = wm.opacity ?? 0.12, sh = h * 0.1;
  return (
    <div className="absolute right-0 bottom-0 flex items-end justify-end pointer-events-none" style={{ paddingRight: Math.max(4, h*0.06), paddingBottom: Math.max(4, h*0.1), zIndex: 3, opacity: wm.type === "logo" ? op : 1 }}>
      {wm.type === "logo" && wm.logoUrl
        ? <img src={wm.logoUrl} alt="" style={{ maxHeight: sh*0.9, maxWidth: w*0.18, objectFit: "contain" }} />
        : <span style={{ fontSize: Math.max(4,h*0.04), fontWeight: 800, letterSpacing: 1.5, color: `rgba(0,0,0,${op})`, textTransform: "uppercase" as const, userSelect: "none" as const }}>{wm.text||"SlipGen"}</span>}
    </div>
  );
}

function CropMarks({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const m=6, o=2, c="#666";
  return (<>
    <div className="absolute" style={{ left:x-m-o, top:y, width:m, height:0.5, background:c }} />
    <div className="absolute" style={{ left:x, top:y-m-o, width:0.5, height:m, background:c }} />
    <div className="absolute" style={{ left:x+w+o, top:y, width:m, height:0.5, background:c }} />
    <div className="absolute" style={{ left:x+w, top:y-m-o, width:0.5, height:m, background:c }} />
    <div className="absolute" style={{ left:x-m-o, top:y+h, width:m, height:0.5, background:c }} />
    <div className="absolute" style={{ left:x, top:y+h+o, width:0.5, height:m, background:c }} />
    <div className="absolute" style={{ left:x+w+o, top:y+h, width:m, height:0.5, background:c }} />
    <div className="absolute" style={{ left:x+w, top:y+h+o, width:0.5, height:m, background:c }} />
  </>);
}
