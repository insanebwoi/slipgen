/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
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

  if (currentStep === "students" || currentStep === "ai-process" || currentStep === "template") {
    const previewStudent: Student = students[0] || {
      id: "preview", name: "Student Name", className: "5th", division: "", rollNo: "", subject: "",
      schoolName: "Your School", passion: "Doctor", gender: "child", imageUrl: null, imageFile: null,
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
        
        <div className="flex items-center gap-1.5 bg-[var(--surface)] rounded-lg p-1 border shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors" style={{ color: 'var(--text-secondary)' }} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium w-10 text-center" style={{ color: 'var(--text-secondary)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors" style={{ color: 'var(--text-secondary)' }} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }}></div>
          <button onClick={handleZoomReset} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors" style={{ color: 'var(--text-secondary)' }} title="100% Zoom">
            <Maximize className="w-4 h-4" />
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
  const scale = len < targetLen ? Math.min(1.15, targetLen / len) : Math.max(0.45, targetLen / len);
  return <p className={className} style={{ ...style, fontSize: baseSize * scale, fontWeight: weight, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: style?.lineHeight || 1.2 }}>{str || " "}</p>;
}

function FieldLine({ label, value, f, color, lineColor }: { label: string; value: string; f: number; color: string; lineColor: string }) {
  const str = (value || " ").trim();
  const len = Math.max(3, str.length);
  const scale = len > 10 ? Math.max(0.45, 10 / len) : 1;
  return (
    <div className="flex items-baseline" style={{ borderBottom: `1px solid ${lineColor}`, paddingBottom: Math.max(1, f*0.15), gap: f*0.25 }}>
      <span style={{ fontSize: f*0.82, fontWeight: 500, color, whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ flex: 1, fontSize: f * scale, fontWeight: 700, color: value ? "#1e293b" : "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value || "."}</span>
    </div>
  );
}

function StdRoll({ std, divis, roll, f, color, lineColor }: { std: string; divis: string; roll: string; f: number; color: string; lineColor: string }) {
  const sLen = Math.max(2, (std || " ").trim().length);
  const sScale = sLen > 5 ? Math.max(0.45, 5 / sLen) : 1;
  const dLen = Math.max(1, (divis || " ").trim().length);
  const dScale = dLen > 3 ? Math.max(0.45, 3 / dLen) : 1;
  const rLen = Math.max(2, (roll || " ").trim().length);
  const rScale = rLen > 5 ? Math.max(0.45, 5 / rLen) : 1;
  return (
    <div className="flex" style={{ gap: f*0.4 }}>
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
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: c.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <div className="absolute inset-0 flex" style={{ padding: pad*0.6, zIndex: 1 }}>
        <div className="flex items-center justify-center" style={{ width: w*0.36 }}>
          <Pic url={s.aiImageUrl||s.imageUrl} size={ps} />
        </div>
        <div className="flex-1 flex items-center" style={{ paddingRight: pad*0.4 }}>
          <div className="w-full h-[88%] flex flex-col justify-between" style={{ background: "#fff", borderRadius: Math.max(4,sc*1.5), padding: `${pad*0.8}px ${pad}px`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf} color={c.name} weight={600} style={{ letterSpacing: 0.3 }} />
            <FieldLine label="Subject:" value={s.subject} f={ff} color={c.fld} lineColor={c.line} />
            <StdRoll std={s.className} divis={s.division} roll={s.rollNo} f={ff} color={c.fld} lineColor={c.line} />
            <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.85} color={c.accent} weight={700} />
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
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: c.base, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent ${stripeSize}px, ${c.stripe} ${stripeSize}px, ${c.stripe} ${stripeSize*2}px)` }} />
      <div className="absolute inset-0 flex" style={{ padding: pad*0.6, zIndex: 1 }}>
        <div className="flex items-center justify-center" style={{ width: w*0.36 }}>
          <Pic url={s.aiImageUrl||s.imageUrl} size={ps} border={`3px solid ${c.pic}`} />
        </div>
        <div className="flex-1 flex items-center" style={{ paddingRight: pad*0.4 }}>
          <div className="w-full h-[88%] flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.95)", borderRadius: Math.max(4,sc*1.5), padding: `${pad*0.8}px ${pad}px`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: `1px solid ${c.border}` }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf} color={c.name} weight={600} style={{ letterSpacing: 0.3 }} />
            <FieldLine label="Subject:" value={s.subject} f={ff} color="#64748b" lineColor={c.line} />
            <StdRoll std={s.className} divis={s.division} roll={s.rollNo} f={ff} color="#64748b" lineColor={c.line} />
            <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.85} color={c.accent} weight={700} />
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
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
      <img src={v.bg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(1.05) saturate(1.1)" }} />
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="absolute inset-0 flex" style={{ padding: pad*0.6, zIndex: 1 }}>
        <div className="flex items-center justify-center" style={{ width: w*0.36 }}>
          <Pic url={s.aiImageUrl||s.imageUrl} size={ps} border="3px solid rgba(255,255,255,0.85)" />
        </div>
        <div className="flex-1 flex items-center" style={{ paddingRight: pad*0.4 }}>
          <div className="w-full h-[88%] flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.92)", borderRadius: Math.max(4,sc*1.5), padding: `${pad*0.8}px ${pad}px`, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", backdropFilter: "blur(4px)" }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf} color="#1e293b" weight={600} style={{ letterSpacing: 0.3 }} />
            <FieldLine label="Subject:" value={s.subject} f={ff} color="#6b7280" lineColor="#d1d5db" />
            <StdRoll std={s.className} divis={s.division} roll={s.rollNo} f={ff} color="#6b7280" lineColor="#d1d5db" />
            <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.85} color={accent} weight={700} />
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
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: c.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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
            <AutoText text={s.name} targetLen={12} baseSize={nf} color={c.name} weight={600} style={{ letterSpacing: 0.3 }} />
            <FieldLine label="Subject:" value={s.subject} f={ff} color="#6b7280" lineColor={c.line} />
            <StdRoll std={s.className} divis={s.division} roll={s.rollNo} f={ff} color="#6b7280" lineColor={c.line} />
            <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.85} color={c.accent} weight={700} />
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
  const nf=Math.max(7,h*0.12), ff=Math.max(5,h*0.08);
  const F = "'Georgia', serif";
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
        <div className="flex-1 flex flex-col justify-center" style={{ paddingLeft: pad*0.8, paddingRight: pad*0.3, gap: pad*1.2 }}>
          <div style={{ textAlign: "center" }}>
            <AutoText text={s.name} targetLen={12} baseSize={nf*1.05} color="#2d1810" weight={600} style={{ fontFamily: F, letterSpacing: 0.2, margin: "0 auto" }} />
          </div>
          <div className="flex flex-col" style={{ gap: pad*0.5 }}>
            <DottedField l="Subject" v={s.subject} f={ff} lf={ff*0.85} fm={F} />
            <div className="flex" style={{ gap: ff*0.5 }}>
              <DottedField l="Class" v={s.className} f={ff} lf={ff*0.85} fm={F} />
              <DottedField l="Div" v={s.division} f={ff} lf={ff*0.85} fm={F} />
              <DottedField l="Roll" v={s.rollNo} f={ff} lf={ff*0.85} fm={F} />
            </div>
          </div>
          <AutoText text={s.schoolName} targetLen={22} baseSize={ff*0.9} color="#8b6914" weight={700} style={{ fontFamily: F, textAlign: "center", borderTop: "1px solid #daa520", paddingTop: 3 }} />
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
  const nf=Math.max(7,h*0.14), ff=Math.max(5,h*0.09);
  const F = "'Georgia', serif";
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: r, background: "radial-gradient(circle at center, #fffef5 0%, #f5ebd5 100%)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      {/* Decorative Vintage Frame */}
      <div className="absolute" style={{ inset: Math.max(3,sc*1), border: "2px solid #5a3e1b", borderRadius: Math.max(2,sc*0.5) }} />
      <div className="absolute" style={{ inset: Math.max(5,sc*1.6), border: "1px solid #8b6914", borderRadius: Math.max(1,sc*0.3) }} />
      <div className="absolute top-0 left-0" style={{ width: sc*5, height: sc*5, borderBottomRightRadius: "100%", border: "1px solid #8b6914", borderTop: "none", borderLeft: "none" }} />
      <div className="absolute top-0 right-0" style={{ width: sc*5, height: sc*5, borderBottomLeftRadius: "100%", border: "1px solid #8b6914", borderTop: "none", borderRight: "none" }} />
      <div className="absolute bottom-0 left-0" style={{ width: sc*5, height: sc*5, borderTopRightRadius: "100%", border: "1px solid #8b6914", borderBottom: "none", borderLeft: "none" }} />
      <div className="absolute bottom-0 right-0" style={{ width: sc*5, height: sc*5, borderTopLeftRadius: "100%", border: "1px solid #8b6914", borderBottom: "none", borderRight: "none" }} />

      <div className="absolute inset-0 flex flex-col justify-center" style={{ padding: pad*1.8, gap: pad*1.5, zIndex: 1 }}>
        <div style={{ textAlign: "center" }}>
          <AutoText text={s.name} targetLen={18} baseSize={nf*1.15} color="#2d1810" weight={600} style={{ fontFamily: F, letterSpacing: 0.2, margin: "0 auto" }} />
        </div>
        
        <div className="flex flex-col" style={{ gap: pad*0.8 }}>
          <DottedField l="Subject" v={s.subject} f={ff} lf={ff*0.85} fm={F} />
          <div className="flex" style={{ gap: ff*0.8 }}>
            <DottedField l="Class" v={s.className} f={ff} lf={ff*0.85} fm={F} />
            <DottedField l="Div" v={s.division} f={ff} lf={ff*0.85} fm={F} />
            <DottedField l="Roll" v={s.rollNo} f={ff} lf={ff*0.85} fm={F} />
          </div>
        </div>

        <AutoText text={s.schoolName} targetLen={30} baseSize={ff*0.9} color="#8b6914" weight={700} style={{ fontFamily: F, textAlign: "center", borderTop: "1px solid #daa520", paddingTop: 3 }} />
      </div>
      <Wm w={w} h={h} wm={wm} />
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
