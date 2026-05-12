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
      <div className="step-actions">
        <button onClick={() => setStep("students")} className="btn-secondary flex-1 flex items-center justify-center gap-2">
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
  "anime-manga": "Hex photo • Radial speed-burst • Diagonal power stripe • Sparks",
  "anime-neon":  "Cyberpunk holo-card • Neon outline + scanlines • Long-name ready",
  "space":       "Cosmic deep-space • Ringed planet photo • Constellation • Shooting star",
  "football":    "Stadium pitch • Kit colors • Jersey number • Captain's armband",
  "retro-y2k":   "💿 Chrome • Glitter sparkles • Pixel border • Holographic shimmer",
  "anime-card":  "TCG style • 5 Rarity levels • Power levels • Special moves",
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
      {template.id === "anime-manga" && <ThumbAnimeManga />}
      {template.id === "anime-neon" && <ThumbAnimeNeon />}
      {template.id === "space" && <ThumbSpace />}
      {template.id === "football" && <ThumbFootball />}
      {template.id === "retro-y2k" && <ThumbRetroY2K />}
      {template.id === "anime-card" && <ThumbAnimeCard />}
    </div>
  );
}

function ThumbAnimeCard() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #b45309 100%)", padding: 1.5 }}>
      <div className="absolute inset-0 flex p-1 gap-1" style={{ background: "#fffbeb", margin: 1.5, border: "0.5px solid #444" }}>
        <div style={{ width: "35%", background: "white", border: "1px solid #daa520", borderRadius: 1 }} />
        <div className="flex-1 flex flex-col gap-[2px] justify-between py-0.5">
          <div style={{ height: 4, width: "90%", background: "#111", borderRadius: 0.5 }} />
          <div className="flex gap-1">
            <div style={{ height: 3, width: "30%", background: "#b45309", borderRadius: 0.5 }} />
            <div style={{ height: 3, width: "30%", background: "#b45309", borderRadius: 0.5 }} />
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.05)", border: "0.5px dashed rgba(0,0,0,0.1)", borderRadius: 0.5 }} />
        </div>
      </div>
      <div className="absolute bottom-1 right-1 flex gap-[0.5px]">
         {[1,2,3].map(i => <div key={i} style={{ fontSize: 4 }}>★</div>)}
      </div>
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

function ThumbAnimeManga() {
  // Hex polygon for the photo frame
  const hex = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (60 * i) * Math.PI / 180;
      pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
    }
    return pts.join(" ");
  };
  const cx = 24, cy = 32, pr = 14;
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#ffeaf3,#ffc8dc)" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 110 65" preserveAspectRatio="none">
        <defs>
          <radialGradient id="t-htg" cx={cx} cy={cy} r="60" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="rgba(157,23,77,0.55)" />
            <stop offset="0.6" stopColor="rgba(157,23,77,0.18)" />
            <stop offset="1" stopColor="rgba(157,23,77,0)" />
          </radialGradient>
          <pattern id="t-dots" x="0" y="0" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="0.55" fill="#150811" />
          </pattern>
          <mask id="t-htmask"><rect width="110" height="65" fill="url(#t-htg)" /></mask>
          <mask id="t-speedmask"><rect width="110" height="65" fill="white" /><polygon points={hex(cx, cy, pr)} fill="black" /></mask>
        </defs>
        <rect width="110" height="65" fill="url(#t-dots)" mask="url(#t-htmask)" opacity="0.5" />
        {/* Speed burst */}
        <g mask="url(#t-speedmask)">
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * 360 * Math.PI / 180;
            return <line key={i} x1={cx + Math.cos(a) * (pr + 2)} y1={cy + Math.sin(a) * (pr + 2)} x2={cx + Math.cos(a) * 80} y2={cy + Math.sin(a) * 80} stroke="rgba(236,72,153,0.55)" strokeWidth={i % 4 === 0 ? 0.8 : 0.4} strokeLinecap="round" />;
          })}
        </g>
        {/* Diagonal stripe */}
        <g transform="rotate(-8 55 32.5)">
          <rect x="-20" y="48" width="160" height="11" fill="#150811" />
          <rect x="-20" y="48" width="160" height="0.6" fill="#ec4899" />
          <rect x="-20" y="58.4" width="160" height="0.6" fill="#ec4899" />
        </g>
        {/* Hex photo frame */}
        <polygon points={hex(cx, cy, pr + 1.5)} fill="#150811" />
        <polygon points={hex(cx, cy, pr + 0.7)} fill="#ec4899" />
        <polygon points={hex(cx, cy, pr)} fill="#fff5fb" />
        {/* Sparks */}
        <polygon points={(() => { const points: string[] = []; const sx = 100, sy = 8, ss = 3; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 - Math.PI / 2; const rd = i % 2 === 0 ? ss : ss * 0.4; points.push(`${sx + Math.cos(a) * rd},${sy + Math.sin(a) * rd}`); } return points.join(" "); })()} fill="#ec4899" stroke="#150811" strokeWidth="0.4" />
        {/* Outer ink border */}
        <rect x="0.5" y="0.5" width="109" height="64" fill="none" stroke="#150811" strokeWidth="1.2" />
      </svg>
      {/* Right text */}
      <div className="absolute" style={{ left: 50, top: 4, right: 4, bottom: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ height: 7, width: "85%", background: "#150811", borderRadius: 1, boxShadow: "1px 1px 0 #ec4899" }} />
        <div className="flex flex-col gap-[2px]">
          <div style={{ height: 2, width: "75%", background: "#150811" }} />
          <div className="flex gap-[2px]">{[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 2, background: "#150811" }} />)}</div>
        </div>
      </div>
      {/* School text on stripe */}
      <div className="absolute" style={{ right: 4, bottom: 4, transform: "rotate(-8deg)", transformOrigin: "right bottom", color: "#fff", fontSize: 4, fontWeight: 800, letterSpacing: 0.5, whiteSpace: "nowrap" }}>★ SCHOOL ★</div>
      <WM />
    </div>
  );
}

function ThumbAnimeNeon() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1a0820,#3a0d3a)" }}>
      {/* Scanlines */}
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(255,45,149,0.18) 2px, rgba(255,45,149,0.18) 2.5px)", opacity: 0.7 }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 110 65" preserveAspectRatio="none">
        <defs>
          <linearGradient id="t-neon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff2d95" />
            <stop offset="0.5" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#ff2d95" />
          </linearGradient>
          <linearGradient id="t-ribbon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff2d95" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {/* Left ribbon */}
        <rect x="0" y="0" width="7" height="65" fill="url(#t-ribbon)" />
        {/* Photo brackets */}
        <line x1="11" y1="14" x2="14.5" y2="14" stroke="#ff2d95" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="11" y1="14" x2="11" y2="17.5" stroke="#ff2d95" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="40" y1="14" x2="36.5" y2="14" stroke="#ff2d95" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="40" y1="14" x2="40" y2="17.5" stroke="#ff2d95" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="11" y1="51" x2="14.5" y2="51" stroke="#ff2d95" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="11" y1="51" x2="11" y2="47.5" stroke="#ff2d95" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="40" y1="51" x2="36.5" y2="51" stroke="#ff2d95" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="40" y1="51" x2="40" y2="47.5" stroke="#ff2d95" strokeWidth="0.9" strokeLinecap="round" />
        {/* Photo body */}
        <rect x="11" y="14" width="29" height="37" fill="#1a0820" />
        {/* Name plate */}
        <rect x="44" y="6" width="63" height="22" rx="2" ry="2" fill="rgba(0,0,0,0.32)" stroke="url(#t-neon)" strokeWidth="0.6" />
        {/* Field tags */}
        <rect x="44" y="32" width="63" height="6" rx="1" ry="1" fill="rgba(0,0,0,0.35)" stroke="#ff2d95" strokeWidth="0.4" />
        <rect x="44" y="40" width="20" height="6" rx="1" ry="1" fill="rgba(0,0,0,0.35)" stroke="#ff2d95" strokeWidth="0.4" />
        <rect x="65.5" y="40" width="14" height="6" rx="1" ry="1" fill="rgba(0,0,0,0.35)" stroke="#ff2d95" strokeWidth="0.4" />
        <rect x="81" y="40" width="26" height="6" rx="1" ry="1" fill="rgba(0,0,0,0.35)" stroke="#ff2d95" strokeWidth="0.4" />
        {/* Diagonal grid lines */}
        {[1,2,3,4].map(i => <line key={i} x1="44" y1={50 + i*2.5} x2={104 - i*1.5} y2={50 + i*2.5} stroke="rgba(255,45,149,0.18)" strokeWidth="0.3" />)}
        {/* ID corner tag */}
        <rect x="92" y="3" width="14" height="3.5" rx="0.5" fill="#ff2d95" />
        {/* Outer neon outline */}
        <rect x="0.6" y="0.6" width="108.8" height="63.8" rx="3" ry="3" fill="none" stroke="url(#t-neon)" strokeWidth="1.1" />
      </svg>
      {/* Katakana hint in ribbon */}
      <div className="absolute" style={{ left: 0, top: 0, width: 7, height: 65, display: "flex", alignItems: "center", justifyContent: "center", color: "#1a0820", fontSize: 4, fontWeight: 800, letterSpacing: 1, writingMode: "vertical-rl" }}>サクラ</div>
      {/* Name placeholder line */}
      <div className="absolute" style={{ left: 47, top: 13, width: 56, height: 4, background: "#ffe2f2", borderRadius: 1, opacity: 0.9 }} />
      <div className="absolute" style={{ left: 47, top: 19, width: 38, height: 3, background: "#ffe2f2", borderRadius: 1, opacity: 0.7 }} />
      <WM />
    </div>
  );
}

function ThumbSpace() {
  // Deterministic star positions for thumbnail
  const stars = Array.from({ length: 30 }, (_, i) => {
    const x = (i * 53.7) % 110;
    const y = (i * 31.3) % 65;
    const r = ((i * 17) % 5) * 0.18 + 0.3;
    const op = 0.4 + ((i * 13) % 10) / 16;
    return { x, y, r, op, twinkle: i % 7 === 0 };
  });
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#0b0418,#2a0a4a)" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 110 65" preserveAspectRatio="none">
        <defs>
          <radialGradient id="t-neb1" cx="0.18" cy="0.7" r="0.6">
            <stop offset="0" stopColor="rgba(168,85,247,0.45)" />
            <stop offset="1" stopColor="rgba(168,85,247,0)" />
          </radialGradient>
          <radialGradient id="t-neb2" cx="0.85" cy="0.25" r="0.55">
            <stop offset="0" stopColor="rgba(236,72,153,0.30)" />
            <stop offset="1" stopColor="rgba(236,72,153,0)" />
          </radialGradient>
          <linearGradient id="t-shoot" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c084fc" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="t-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0b0418" stopOpacity="0.92" />
            <stop offset="1" stopColor="#c084fc" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <rect width="110" height="65" fill="url(#t-neb1)" />
        <rect width="110" height="65" fill="url(#t-neb2)" />
        {/* Stars */}
        {stars.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r}
            fill={st.twinkle ? "#c084fc" : "#fff"} opacity={st.op} />
        ))}
        {/* Constellation */}
        {[[60, 18], [68, 28], [77, 22], [83, 34], [90, 20]].map(([cx, cy], i, arr) => (
          i < arr.length - 1
            ? <line key={i} x1={cx} y1={cy} x2={arr[i+1][0]} y2={arr[i+1][1]} stroke="#c084fc" strokeWidth="0.25" opacity="0.5" />
            : null
        ))}
        {/* Shooting star */}
        <line x1="58" y1="6" x2="98" y2="32" stroke="url(#t-shoot)" strokeWidth="0.5" />
        <circle cx="98" cy="32" r="0.9" fill="#fff" />
        {/* Saturn ring around photo */}
        <g transform="rotate(-22 24 30)">
          <ellipse cx="24" cy="30" rx="20" ry="6" fill="none" stroke="rgba(244,114,182,0.7)" strokeWidth="0.45" />
          <ellipse cx="24" cy="30" rx="24" ry="8" fill="none" stroke="rgba(244,114,182,0.4)" strokeWidth="0.25" />
        </g>
        {/* Photo halo */}
        <circle cx="24" cy="30" r="14" fill="rgba(192,132,252,0.4)" />
        <circle cx="24" cy="30" r="12.5" fill="#c084fc" opacity="0.55" />
        {/* Bottom band */}
        <rect x="0" y="50" width="110" height="15" fill="url(#t-band)" />
        <line x1="0" y1="50" x2="110" y2="50" stroke="#c084fc" strokeWidth="0.3" />
        {/* Outer border */}
        <rect x="0.5" y="0.5" width="109" height="64" fill="none" stroke="#c084fc" strokeWidth="0.6" opacity="0.6" />
      </svg>
      {/* Photo planet */}
      <div className="absolute rounded-full" style={{ left: 13, top: 19, width: 22, height: 22, background: "linear-gradient(135deg,#a855f7,#ec4899)", boxShadow: "inset 4px 4px 8px rgba(255,255,255,0.25), inset -4px -4px 8px rgba(0,0,0,0.45)" }} />
      {/* Right text */}
      <div className="absolute" style={{ left: 42, top: 5, right: 4, bottom: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ height: 5, width: "85%", background: "#f3e8ff", borderRadius: 1, opacity: 0.92 }} />
        <div className="flex flex-col gap-[1.5px]">
          <div style={{ height: 3, width: "85%", background: "rgba(255,255,255,0.08)", borderLeft: "1px solid #c084fc" }} />
          <div className="flex gap-[2px]">
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderLeft: "1px solid #c084fc" }} />
            <div style={{ flex: 0.7, height: 3, background: "rgba(255,255,255,0.08)", borderLeft: "1px solid #c084fc" }} />
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderLeft: "1px solid #c084fc" }} />
          </div>
        </div>
      </div>
      {/* School text on band */}
      <div className="absolute" style={{ left: 0, right: 0, bottom: 5, textAlign: "center", color: "#f3e8ff", fontSize: 4, fontWeight: 700, letterSpacing: 0.6, whiteSpace: "nowrap" }}>✦ SCHOOL ✦</div>
      <WM />
    </div>
  );
}

function ThumbFootball() {
  return (
    <div className="absolute inset-0" style={{ background: "#1a0606" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 110 65" preserveAspectRatio="none">
        <defs>
          <linearGradient id="t-fb-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#dc2626" />
            <stop offset="1" stopColor="#1a0606" />
          </linearGradient>
          <linearGradient id="t-fb-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d4d20" />
            <stop offset="1" stopColor="#062012" />
          </linearGradient>
          <radialGradient id="t-fb-spot" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Top chevron */}
        <polygon points="0,0 70,0 50,38 0,38" fill="url(#t-fb-band)" />
        <polygon points="70,0 110,0 110,38 50,38" fill="#1a0606" />
        <polygon points="70,0 71,0 51,38 50,38" fill="#fbbf24" />
        {/* Spotlight */}
        <rect width="110" height="48" fill="url(#t-fb-spot)" />
        {/* Pitch */}
        <rect x="0" y="48" width="110" height="17" fill="url(#t-fb-grass)" />
        {/* Mowing stripes */}
        {[0,1,2,3,4,5].map(i => <rect key={i} x={i * 18.3} y="48" width="9" height="17" fill="#062012" opacity="0.25" />)}
        {/* Pitch lines */}
        <line x1="55" y1="48" x2="55" y2="65" stroke="#fff" strokeWidth="0.4" opacity="0.55" />
        <circle cx="55" cy="56.5" r="6" fill="none" stroke="#fff" strokeWidth="0.4" opacity="0.55" />
        <circle cx="55" cy="56.5" r="0.8" fill="#fff" opacity="0.55" />
        <line x1="0" y1="48" x2="110" y2="48" stroke="#fbbf24" strokeWidth="0.6" />
        {/* Football */}
        <circle cx="20" cy="56.5" r="3" fill="#fff" stroke="#1a0606" strokeWidth="0.3" />
        <polygon points="20,55 21.4,56, 20.9,57.6, 19.1,57.6, 18.6,56" fill="#1a0606" transform="translate(0 -0.3)" />
        {/* Trophy */}
        <g transform="translate(96 4)">
          <path d="M 0 1.5 L 0 0 L 7 0 L 7 1.5 C 7 4.2, 4.5 4.5, 3.5 4.5 C 2.5 4.5, 0 4.2, 0 1.5 Z" fill="#fbbf24" stroke="#1a0606" strokeWidth="0.3" />
          <rect x="2.7" y="4.4" width="1.6" height="1.4" fill="#fbbf24" />
          <rect x="1.2" y="5.6" width="4.6" height="1.0" fill="#fbbf24" stroke="#1a0606" strokeWidth="0.3" />
        </g>
        {/* Photo halo */}
        <circle cx="22" cy="27" r="14" fill="#fbbf24" />
        <circle cx="22" cy="27" r="11.5" fill="#1a0606" />
        {/* Captain armband */}
        <rect x="18" y="14.5" width="8" height="2" fill="#fbbf24" stroke="#1a0606" strokeWidth="0.3" />
        <text x="22" y="16.2" textAnchor="middle" fontSize="2" fontWeight="700" fill="#1a0606">C</text>
        {/* Outer border */}
        <rect x="0.5" y="0.5" width="109" height="64" fill="none" stroke="#fbbf24" strokeWidth="0.6" opacity="0.7" />
      </svg>
      {/* Photo (player) — circle */}
      <div className="absolute rounded-full" style={{ left: 12, top: 17, width: 20, height: 20, background: "linear-gradient(135deg,#dc2626,#1a0606)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)" }} />
      {/* Jersey number badge */}
      <div className="absolute rounded-full flex items-center justify-center" style={{ left: 27, top: 28, width: 9, height: 9, background: "#fbbf24", border: "1px solid #1a0606", color: "#1a0606", fontSize: 5, fontWeight: 800, boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>9</div>
      {/* Right text */}
      <div className="absolute" style={{ left: 42, top: 4, right: 4, bottom: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ height: 7, width: "85%", background: "#fff5f5", borderRadius: 1, boxShadow: "1px 1px 0 #dc2626" }} />
        <div className="flex flex-col gap-[1.5px]">
          <div style={{ height: 3, width: "85%", background: "rgba(0,0,0,0.45)", borderLeft: "1.2px solid #fbbf24" }} />
          <div className="flex gap-[2px]">
            <div style={{ flex: 1, height: 3, background: "rgba(0,0,0,0.45)", borderLeft: "1.2px solid #fbbf24" }} />
            <div style={{ flex: 0.7, height: 3, background: "rgba(0,0,0,0.45)", borderLeft: "1.2px solid #fbbf24" }} />
            <div style={{ flex: 1, height: 3, background: "rgba(0,0,0,0.45)", borderLeft: "1.2px solid #fbbf24" }} />
          </div>
        </div>
      </div>
      {/* School text on pitch */}
      <div className="absolute" style={{ left: 0, right: 0, bottom: 5, textAlign: "center", color: "#fff", fontSize: 4, fontWeight: 800, letterSpacing: 0.6, whiteSpace: "nowrap", textShadow: "0.4px 0.4px 0 #1a0606" }}>⚽ FC SCHOOL ⚽</div>
      <WM />
    </div>
  );
}

function ThumbRetroY2K() {
  // Same 4-point sparkle helper, scaled for the thumbnail
  const sparkle = (cx: number, cy: number, sz: number) => {
    const tt = sz * 0.18;
    return `M ${cx} ${cy-sz} L ${cx+tt} ${cy-tt} L ${cx+sz} ${cy} L ${cx+tt} ${cy+tt} L ${cx} ${cy+sz} L ${cx-tt} ${cy+tt} L ${cx-sz} ${cy} L ${cx-tt} ${cy-tt} Z`;
  };
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#fbcfe8 0%,#bae6fd 30%,#ddd6fe 60%,#fef3c7 100%)" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 110 65" preserveAspectRatio="none">
        <defs>
          <linearGradient id="t-y2k-holo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(236,72,153,0.20)" />
            <stop offset="0.5" stopColor="rgba(34,211,238,0.20)" />
            <stop offset="1" stopColor="rgba(251,191,36,0.20)" />
          </linearGradient>
          <linearGradient id="t-y2k-chrome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.18" stopColor="#dbe5f1" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="0.82" stopColor="#ec4899" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        <rect width="110" height="65" fill="url(#t-y2k-holo)" />
        {/* Cloud */}
        <ellipse cx="92" cy="11" rx="14" ry="6" fill="rgba(255,255,255,0.6)" />
        <ellipse cx="34" cy="6" rx="8" ry="4" fill="rgba(255,255,255,0.6)" />
        {/* Pixel border */}
        {Array.from({ length: 25 }, (_, i) => {
          const x = 3 + i*4.2;
          const c = i % 2 === 0 ? "#ec4899" : "#8b5cf6";
          return (
            <g key={i}>
              <rect x={x} y={3} width={2} height={2} fill={c} />
              <rect x={x} y={60} width={2} height={2} fill={c} />
            </g>
          );
        })}
        {Array.from({ length: 13 }, (_, i) => {
          const y = 7 + i*4.2;
          const c = i % 2 === 0 ? "#ec4899" : "#8b5cf6";
          return (
            <g key={i}>
              <rect x={3} y={y} width={2} height={2} fill={c} />
              <rect x={105} y={y} width={2} height={2} fill={c} />
            </g>
          );
        })}
        {/* Photo halo (chrome) */}
        <circle cx="22" cy="29" r="13.5" fill="url(#t-y2k-chrome)" stroke="#3b0764" strokeWidth="0.4" />
        <circle cx="22" cy="29" r="11" fill="#fff" />
        {/* Sparkles */}
        <path d={sparkle(70, 18, 2.4)} fill="#fff" />
        <path d={sparkle(85, 32, 1.8)} fill="#ec4899" />
        <path d={sparkle(50, 14, 1.5)} fill="#8b5cf6" />
        <path d={sparkle(95, 42, 1.4)} fill="#fff" />
        <path d={sparkle(45, 36, 1.2)} fill="#ec4899" />
        {/* Bottom chrome pill */}
        <rect x="4" y="51" width="102" height="11" rx="5.5" ry="5.5" fill="url(#t-y2k-chrome)" stroke="#3b0764" strokeWidth="0.4" />
        <rect x="6" y="52.5" width="98" height="3.5" rx="1.7" ry="1.7" fill="rgba(255,255,255,0.6)" />
      </svg>
      {/* Floating emoji decorations */}
      <div className="absolute" style={{ left: 5, top: 4, fontSize: 7, transform: "rotate(-12deg)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))" }}>💿</div>
      <div className="absolute" style={{ right: 7, top: 4, fontSize: 6, transform: "rotate(15deg)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))" }}>✨</div>
      {/* Chip rows on the right */}
      <div className="absolute" style={{ left: 42, top: 11, right: 4, bottom: 17, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Chrome name plate */}
        <div style={{ height: 8, width: "85%", background: "#fff5fb", borderRadius: 1, boxShadow: "0 -0.6px 0 #fff, 0 0.6px 0 #ec4899, 0.6px 0.6px 0 #8b5cf6" }} />
        <div className="flex flex-col gap-[2px]">
          <div style={{ height: 4, width: "80%", background: "rgba(255,255,255,0.78)", border: "0.5px solid #ec4899", borderRadius: 6, boxShadow: "inset 0 0.5px 0.8px rgba(255,255,255,0.7)" }} />
          <div className="flex gap-[2px]">
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.78)", border: "0.5px solid #ec4899", borderRadius: 6 }} />
            <div style={{ flex: 0.7, height: 4, background: "rgba(255,255,255,0.78)", border: "0.5px solid #ec4899", borderRadius: 6 }} />
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.78)", border: "0.5px solid #ec4899", borderRadius: 6 }} />
          </div>
        </div>
      </div>
      <div className="absolute" style={{ left: 0, right: 0, bottom: 5, textAlign: "center", color: "#3b0764", fontSize: 4.5, fontWeight: 800, letterSpacing: 0.4, whiteSpace: "nowrap", textShadow: "0 0.4px 0 rgba(255,255,255,0.85)" }}>💖 SCHOOL ⭐</div>
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
