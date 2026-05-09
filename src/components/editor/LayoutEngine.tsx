/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { useSlipGenStore, SLIPGEN_LOGO_URL } from "@/lib/store";
import { PAPER_SIZES, PaperSize } from "@/types";
import { ArrowLeft, ArrowRight, Ruler, Copy, Grid3X3, Scissors, AlertTriangle, Stamp, Upload, Lock } from "lucide-react";

export default function LayoutEngine() {
  const { layoutConfig, setLayoutConfig, layoutResult, recalculateLayout, setStep, students, watermark, setWatermark, userPlan } = useSlipGenStore();
  const logoInputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { recalculateLayout(); }, []);

  const paperSizes = Object.keys(PAPER_SIZES) as PaperSize[];

  // Paid plans can customize watermark text, toggle it off, upload a logo, change opacity.
  // Free plan is locked: watermark is forced on with text "SlipGen" — no controls.
  const canCustomizeWatermark = ['basic', 'standard'].includes(userPlan);
  // Logo upload is paid-only too.
  const canUploadLogo = canCustomizeWatermark;

  // Lock free plan to the SlipGen brand logo watermark — can't be disabled, swapped, or changed.
  useEffect(() => {
    if (canCustomizeWatermark) return;
    if (!watermark.enabled || watermark.type !== 'logo' || watermark.logoUrl !== SLIPGEN_LOGO_URL) {
      setWatermark({ enabled: true, type: 'logo', logoUrl: SLIPGEN_LOGO_URL });
    }
  }, [canCustomizeWatermark, watermark.enabled, watermark.type, watermark.logoUrl, setWatermark]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setWatermark({ type: 'logo', logoUrl: url });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Smart Layout Engine
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Optimize slip placement for minimal paper waste
        </p>
      </div>

      {/* Paper Size */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Ruler className="w-4 h-4" style={{ color: "var(--primary)" }} />
          Paper Size
        </label>
        <div className="grid grid-cols-3 gap-2">
          {paperSizes.map((size) => (
            <button
              key={size}
              onClick={() => setLayoutConfig({ paperSize: size })}
              className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all border ${
                layoutConfig.paperSize === size
                  ? "border-[var(--primary)] text-white"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              }`}
              style={layoutConfig.paperSize === size ? { background: "rgba(99,102,241,0.15)" } : { background: "var(--surface)" }}
            >
              {size === "13x19" ? "13×19" : size}
            </button>
          ))}
        </div>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          {PAPER_SIZES[layoutConfig.paperSize].label}
        </p>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Copy className="w-4 h-4" style={{ color: "var(--primary)" }} />
            Copies per Student
          </label>
          {layoutResult && (
            <button
              onClick={() => setLayoutConfig({ autoFillPage: true })}
              className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-colors ${
                layoutConfig.autoFillPage ? "bg-[var(--primary)] text-white" : "bg-[var(--primary-light)] text-[var(--primary)]"
              }`}
            >
              {layoutConfig.autoFillPage ? "Auto-Filling" : "Fill Page"} ({layoutResult.totalSlips})
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1} max={layoutResult ? Math.max(10, layoutResult.totalSlips) : 20} value={layoutConfig.copies}
            onChange={(e) => setLayoutConfig({ copies: parseInt(e.target.value) })}
            className="flex-1 accent-[var(--primary)]"
          />
          <span className="text-sm font-bold w-8 text-center">{layoutConfig.copies}</span>
        </div>
      </div>

      {/* Margin */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Grid3X3 className="w-4 h-4" style={{ color: "var(--primary)" }} />
          Margin (mm)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0} max={25} value={layoutConfig.margin}
            onChange={(e) => setLayoutConfig({ margin: parseInt(e.target.value) })}
            className="flex-1 accent-[var(--primary)]"
          />
          <span className="text-sm font-bold w-8 text-center">{layoutConfig.margin}</span>
        </div>
      </div>

      {/* Gap */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Scissors className="w-4 h-4" style={{ color: "var(--primary)" }} />
          Gap Between Slips (mm)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0} max={10} value={layoutConfig.gap}
            onChange={(e) => setLayoutConfig({ gap: parseInt(e.target.value) })}
            className="flex-1 accent-[var(--primary)]"
          />
          <span className="text-sm font-bold w-8 text-center">{layoutConfig.gap}</span>
        </div>
      </div>

      {/* Crop Marks & Bleed */}
      <div className="mb-5 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={layoutConfig.showCropMarks}
            onChange={(e) => setLayoutConfig({ showCropMarks: e.target.checked })}
            className="accent-[var(--primary)] w-4 h-4"
          />
          <span className="text-sm">Show crop marks</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={layoutConfig.showBleedMargin}
            onChange={(e) => setLayoutConfig({ showBleedMargin: e.target.checked })}
            className="accent-[var(--primary)] w-4 h-4"
          />
          <span className="text-sm">Add bleed margin</span>
        </label>
        {layoutConfig.showBleedMargin && (
          <div className="ml-7">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1} max={5} value={layoutConfig.bleedMargin}
                onChange={(e) => setLayoutConfig({ bleedMargin: parseInt(e.target.value) })}
                className="flex-1 accent-[var(--primary)]"
              />
              <span className="text-xs font-bold w-8 text-center">{layoutConfig.bleedMargin}mm</span>
            </div>
          </div>
        )}
      </div>

      {/* ============ WATERMARK SETTINGS ============ */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Stamp className="w-4 h-4" style={{ color: "var(--primary)" }} />
          Watermark
        </label>

        {!canCustomizeWatermark && (
          <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <img src={SLIPGEN_LOGO_URL} alt="SlipGen" className="w-10 h-10 rounded-md object-contain flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--warning)" }}>
                <Lock className="w-3 h-3" /> Free plan: SlipGen logo watermark is fixed
              </p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                Upgrade to Basic or Standard to swap it for your school logo, change opacity, or remove it.
              </p>
            </div>
          </div>
        )}

        {canCustomizeWatermark && (
        <>
        {/* Enable/Disable */}
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={watermark.enabled}
            onChange={(e) => setWatermark({ enabled: e.target.checked })}
            className="accent-[var(--primary)] w-4 h-4"
          />
          <span className="text-sm">Show watermark on slips</span>
        </label>

        {watermark.enabled && (
          <div className="ml-1 space-y-3">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setWatermark({ type: 'text' })}
                className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                style={{
                  background: watermark.type === 'text' ? 'var(--primary)' : 'var(--surface-elevated)',
                  color: watermark.type === 'text' ? '#fff' : 'var(--text-secondary)',
                  borderColor: watermark.type === 'text' ? 'var(--primary)' : 'var(--border)',
                }}
              >
                📝 Text
              </button>
              <button
                onClick={() => {
                  if (canUploadLogo) {
                    setWatermark({ type: 'logo' });
                  }
                }}
                className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all relative"
                style={{
                  background: watermark.type === 'logo' ? 'var(--primary)' : 'var(--surface-elevated)',
                  color: watermark.type === 'logo' ? '#fff' : canUploadLogo ? 'var(--text-secondary)' : 'var(--text-muted)',
                  borderColor: watermark.type === 'logo' ? 'var(--primary)' : 'var(--border)',
                  opacity: canUploadLogo ? 1 : 0.5,
                }}
              >
                🖼️ Logo {!canUploadLogo && '🔒'}
              </button>
            </div>

            {!canUploadLogo && watermark.type === 'text' && (
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Upgrade to Basic plan to upload your school logo as watermark
              </p>
            )}

            {/* Text Input */}
            {watermark.type === 'text' && (
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Watermark text (e.g., School Name)"
                value={watermark.text}
                onChange={(e) => setWatermark({ text: e.target.value })}
              />
            )}

            {/* Logo Upload */}
            {watermark.type === 'logo' && canUploadLogo && (
              <div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {watermark.logoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={watermark.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain" style={{ background: "var(--surface-hover)" }} />
                    <div className="flex-1">
                      <p className="text-xs text-green-500 font-medium">Logo uploaded ✓</p>
                      <button onClick={() => logoInputRef.current?.click()} className="text-[10px] underline" style={{ color: "var(--primary)" }}>
                        Change logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs transition-colors hover:border-[var(--primary)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                  >
                    <Upload className="w-4 h-4" /> Upload school logo
                  </button>
                )}
              </div>
            )}

            {/* Opacity */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>
                Opacity: {Math.round((watermark.opacity ?? 0.15) * 100)}%
              </label>
              <input
                type="range"
                min={20} max={100} value={Math.round((watermark.opacity ?? 0.15) * 100)}
                onChange={(e) => setWatermark({ opacity: parseInt(e.target.value) / 100 })}
                className="w-full accent-[var(--primary)]"
              />
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Layout Stats */}
      {layoutResult && (
        <div className="glass-card p-4 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
            Layout Analysis
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl font-bold gradient-text" style={{ fontFamily: "var(--font-display)" }}>
                {layoutResult.totalSlips}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Slips per page</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--success)", fontFamily: "var(--font-display)" }}>
                {(100 - layoutResult.wastePercentage).toFixed(1)}%
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Paper utilization</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {layoutResult.cols} × {layoutResult.rows}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Grid layout</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: layoutResult.wastePercentage > 40 ? "var(--warning)" : "var(--success)" }}>
                {layoutResult.wastePercentage.toFixed(1)}%
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Waste</p>
            </div>
          </div>
          {layoutResult.wastePercentage > 40 && (
            <div className="mt-3 flex items-start gap-2 p-2 rounded-lg" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
              <p className="text-xs" style={{ color: "var(--warning)" }}>
                High waste detected. Try adjusting paper size or margins for better utilization.
              </p>
            </div>
          )}
          {students.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {students.length} students × {layoutConfig.copies} copies = {students.length * layoutConfig.copies} slips total
                → <strong>{Math.ceil((students.length * layoutConfig.copies) / layoutResult.totalSlips)} page(s)</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={() => setStep("template")} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => setStep("export")} className="btn-primary flex-1 flex items-center justify-center gap-2">
          Export <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
