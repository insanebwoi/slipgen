"use client";

import { useState, useCallback } from "react";
import { useSlipGenStore } from "@/lib/store";
import { ArrowLeft, Download, FileText, Image as ImageIcon, Loader2, CheckCircle2, Lock, Zap } from "lucide-react";

// Export quality presets. Cartoon-style slips have smooth gradients and flat colors,
// which compress extremely well as JPEG — the difference between 0.95 and 0.85 is
// invisible to the eye but the file is ~40% smaller. PNG is offered for users who
// genuinely need lossless (e.g. logos with hard edges, brand-strict customers).
type Quality = "compressed" | "high" | "lossless";
const QUALITY_PRESETS: Record<Quality, { label: string; jpegQuality: number; description: string; usePng: boolean }> = {
  compressed: { label: "Compressed", jpegQuality: 0.82, description: "Smallest file · perfect for sharing", usePng: false },
  high:       { label: "High",       jpegQuality: 0.95, description: "Print-ready · visually lossless",    usePng: false },
  lossless:   { label: "Lossless",   jpegQuality: 1.0,  description: "Largest file · pixel-perfect PNG",   usePng: true  },
};

// Mobile WebKit (iOS Safari, in-app browsers) historically struggled with very
// large canvases, but with photos now pre-compressed at upload time the real
// constraint is just the canvas pixel ceiling (~16 MP on iOS, ~64 MP on Android).
// Detection is still useful for the pre-warm rasterize and Web Share fallback.
const isMobileWebKit = () => {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};
const isIOS = () => {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// Compute the highest DPI that fits under the platform's max canvas size.
// iOS: ~16.7M pixels (4096×4096 hard cap on older devices, looser on newer).
// Android Chrome / desktop: effectively unlimited for our needs.
// We back off in steps (300 → 250 → 200 → 150) until we land safely.
function safeDpiFor(intrinsicWidthPx: number, intrinsicHeightPx: number, requestedDpi: number): number {
  const maxPixels = isIOS() ? 16_000_000 : 64_000_000;
  // intrinsic px is already at preview scale (96 DPI). Output px = intrinsic × (dpi/96).
  const ratio = requestedDpi / 96;
  const wantedPixels = intrinsicWidthPx * ratio * intrinsicHeightPx * ratio;
  if (wantedPixels <= maxPixels) return requestedDpi;
  // Scale DPI down to fit, rounded to the nearest 25 DPI step for predictability.
  const fitRatio = Math.sqrt(maxPixels / (intrinsicWidthPx * intrinsicHeightPx));
  const fittedDpi = Math.floor((fitRatio * 96) / 25) * 25;
  return Math.max(150, fittedDpi); // never go below 150 even if memory-starved
}

export default function ExportPanel() {
  const { students, selectedTemplate, layoutConfig, layoutResult, setStep, isExporting, setIsExporting, userPlan } = useSlipGenStore();
  const [exportFormat, setExportFormat] = useState<"pdf" | "png">("pdf");
  const [exportDpi, setExportDpi] = useState(200);
  const [quality, setQuality] = useState<Quality>("high");
  const [exported, setExported] = useState(false);
  const [lastFileSize, setLastFileSize] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (!selectedTemplate || !layoutResult) return;
    setIsExporting(true);
    setExported(false);
    setLastFileSize(null);
    setExportError(null);

    try {
      const { default: jsPDF } = await import("jspdf");
      const { toJpeg, toPng } = await import("html-to-image");

      const allCanvases = document.querySelectorAll<HTMLElement>("#layout-preview-canvas");
      let previewEl: HTMLElement | null = null;
      for (const el of allCanvases) {
        if (el.offsetWidth > 0 && el.offsetHeight > 0) { previewEl = el; break; }
      }
      if (!previewEl) {
        setExportError("Preview is not visible. Scroll to it or open the fullscreen preview, then try again.");
        setIsExporting(false);
        return;
      }

      const preset = QUALITY_PRESETS[quality];

      // The preview applies `transform: scale(zoom)` for on-screen sizing. We need the
      // INTRINSIC (untransformed) size so the export captures the full document, not the
      // shrunk view. offsetWidth/offsetHeight are unaffected by CSS transforms — perfect.
      const fullW = previewEl.offsetWidth;
      const fullH = previewEl.offsetHeight;

      // Pick the highest DPI that fits within the platform's canvas-pixel ceiling.
      // Mobile now matches desktop quality whenever memory allows; only steps down
      // automatically if the requested DPI would crash the canvas.
      const effectiveDpi = safeDpiFor(fullW, fullH, exportDpi);

      // ===== Pre-load every <img> inside the preview before rasterization. =====
      // The "[object Event]" rejection from html-to-image is an <img>.onerror Event,
      // which fires when an embedded image hasn't finished decoding when the
      // SVG-foreignObject pipeline tries to read it. iOS Safari is especially picky
      // with large data: URIs (AI student photos). Awaiting decode() here means we
      // only call html-to-image when every image is guaranteed-ready.
      const imgs = Array.from(previewEl.querySelectorAll("img"));
      await Promise.all(imgs.map(async (img) => {
        try {
          if (img.complete && img.naturalWidth > 0) return;
          // decode() is the modern, well-supported way to await full decoding.
          if (typeof img.decode === "function") {
            await img.decode().catch(() => {/* fall through to event-based wait */});
            if (img.complete && img.naturalWidth > 0) return;
          }
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true }); // resolve on error too — we don't want to hang the export
          });
        } catch { /* ignore — capture will continue without this image */ }
      }));

      // Temporarily clear the transform on the source element during rasterization.
      // html-to-image walks the live DOM, so an element with `transform: scale(0.5)`
      // produces a half-size capture even if the clone overrides it. Removing the
      // inline style from the source for the duration of the capture is the only
      // reliable cross-browser way to get a 1:1 export.
      const prevTransform = previewEl.style.transform;
      const prevOrigin = previewEl.style.transformOrigin;
      previewEl.style.transform = "none";
      previewEl.style.transformOrigin = "top left";

      const captureOpts = {
        pixelRatio: effectiveDpi / 96,
        backgroundColor: "#ffffff",
        // IMPORTANT: cacheBust must be FALSE. It appends "?t=…" to every <img src>,
        // which mangles data: URIs (AI student photos) and triggers the
        // "[object Event]" failure on mobile. Leave caching to the browser.
        cacheBust: false,
        // Pin width/height to the intrinsic size, not the scaled rect.
        width: fullW,
        height: fullH,
        style: { transform: "none", transformOrigin: "top left" },
        // Skip any <img> that fails to load instead of rejecting the whole export.
        // Most failures are transient; better to ship a near-perfect export than nothing.
        imagePlaceholder:
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='10' height='10' fill='%23eeeeee'/></svg>",
          ),
      };

      // iOS/Safari workaround: html-to-image's first call frequently misses fonts/images
      // because the SVG-foreignObject pipeline hasn't loaded resources yet. Calling twice
      // and discarding the first result is the documented fix.
      const rasterize = async () => preset.usePng
        ? await toPng(previewEl!, captureOpts)
        : await toJpeg(previewEl!, { ...captureOpts, quality: preset.jpegQuality });

      let imgData: string | null = null;
      try {
        if (isMobileWebKit()) {
          await rasterize().catch(() => null); // pre-warm; ignore errors
        }
        imgData = await rasterize();
      } finally {
        // Always restore the on-screen transform, even if rasterize threw.
        previewEl.style.transform = prevTransform;
        previewEl.style.transformOrigin = prevOrigin;
      }

      if (!imgData || imgData.length < 100) {
        throw new Error("Renderer produced an empty image. Reload the page and try again.");
      }

      const imageMime = preset.usePng ? "PNG" : "JPEG";
      const fileName = students.length > 0
        ? `${students[0].name.trim().replace(/\s+/g, '_')}_slipgen`
        : "slipgen-export";

      // Convert data-URL to Blob (required for reliable mobile downloads)
      const dataUrlToBlob = (dataUrl: string): Blob => {
        const parts = dataUrl.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
        const bin = atob(parts[1]);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return new Blob([arr], { type: mime });
      };

      // Mobile-friendly download helper
      const downloadBlob = async (blob: Blob, name: string) => {
        // Try Web Share API first (best UX on iOS/Android)
        if (typeof navigator !== "undefined" && navigator.share && typeof navigator.canShare === "function") {
          try {
            const file = new File([blob], name, { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: "SlipGen Export" });
              return;
            }
          } catch {
            // User cancelled or unsupported — fall through to anchor download
          }
        }
        // Fallback: Blob URL + anchor click
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      };

      let outputBlobSize = 0;

      if (exportFormat === "png") {
        const ext = preset.usePng ? "png" : "jpg";
        const blob = dataUrlToBlob(imgData);
        outputBlobSize = blob.size;
        await downloadBlob(blob, `${fileName}.${ext}`);
      } else {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: layoutConfig.paperSize === "13x19" ? [330, 483] : layoutConfig.paperSize.toLowerCase() as "a4" | "a3",
          compress: true,
        });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, imageMime, 0, 0, pdfW, pdfH, undefined, "FAST");
        const blob = pdf.output("blob");
        outputBlobSize = blob.size;
        await downloadBlob(blob, `${fileName}.pdf`);
      }

      setLastFileSize(outputBlobSize);
      setExported(true);
    } catch (err) {
      console.error("Export failed:", err);
      // Extract a useful message. html-to-image rejects with raw <img>.onerror Events
      // when an embedded image fails to decode — those would render as "[object Event]"
      // via the default String() coercion, which is useless to the user.
      const msg =
        err instanceof Error ? err.message :
        err instanceof Event  ? "An image inside the preview failed to load (likely a student photo). Try re-uploading the photo and re-export." :
        typeof err === "string" ? err :
        "Unknown error";
      setExportError(
        isMobileWebKit()
          ? `Export failed on mobile: ${msg}`
          : `Export failed: ${msg}`,
      );
    } finally {
      setIsExporting(false);
    }
  }, [selectedTemplate, layoutResult, layoutConfig, exportFormat, exportDpi, quality, students, setIsExporting]);

  const totalSlips = students.length * layoutConfig.copies;
  const pagesNeeded = layoutResult ? Math.ceil(totalSlips / layoutResult.totalSlips) : 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Export & Print
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Generate print-ready files for your name slips
        </p>
      </div>

      {/* Summary */}
      <div className="glass-card p-4 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
          Export Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Students</span>
            <span className="font-semibold">{students.length}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Copies each</span>
            <span className="font-semibold">{layoutConfig.copies}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Total slips</span>
            <span className="font-semibold">{totalSlips}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Paper size</span>
            <span className="font-semibold">{layoutConfig.paperSize}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Pages needed</span>
            <span className="font-bold gradient-text">{pagesNeeded}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Template</span>
            <span className="font-semibold">{selectedTemplate?.name}</span>
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-5">
        <label className="text-sm font-medium mb-2 block">Export Format</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setExportFormat("pdf")}
            className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
              exportFormat === "pdf" ? "border-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
            style={exportFormat === "pdf" ? { background: "rgba(99,102,241,0.15)" } : { background: "var(--surface)" }}
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={() => setExportFormat("png")}
            className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
              exportFormat === "png" ? "border-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
            style={exportFormat === "png" ? { background: "rgba(99,102,241,0.15)" } : { background: "var(--surface)" }}
          >
            <ImageIcon className="w-4 h-4" /> Image
          </button>
        </div>
      </div>

      {/* Quality */}
      <div className="mb-5">
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: "var(--primary)" }} />
          File Quality
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(QUALITY_PRESETS) as Quality[]).map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
                quality === q ? "border-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--text-secondary)]"
              }`}
              style={quality === q ? { background: "rgba(99,102,241,0.15)" } : { background: "var(--surface)" }}
            >
              {QUALITY_PRESETS[q].label}
            </button>
          ))}
        </div>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          {QUALITY_PRESETS[quality].description}
        </p>
      </div>

      {/* DPI */}
      <div className="mb-5">
        <label className="text-sm font-medium mb-2 block">Resolution</label>
        <div className="grid grid-cols-3 gap-2">
          {[150, 200, 300].map((dpi) => (
            <button
              key={dpi}
              onClick={() => setExportDpi(dpi)}
              className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                exportDpi === dpi ? "border-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--text-secondary)]"
              }`}
              style={exportDpi === dpi ? { background: "rgba(99,102,241,0.15)" } : { background: "var(--surface)" }}
            >
              {dpi} DPI
            </button>
          ))}
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {exportDpi <= 150 ? "Screen / draft" : exportDpi <= 200 ? "Recommended for cartoon slips" : "Sharpest detail · larger file"}
        </p>
      </div>

      {/* Watermark Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Watermark</label>
        <div className="space-y-2">
          {userPlan === 'free' ? (
            <>
              {/* Free plan: SlipGen logo is active + WhatsApp upgrade options */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--primary)]" style={{ background: "rgba(99,102,241,0.1)" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-sm font-medium">SlipGen Logo</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>Active</span>
              </div>

              <a
                href={`https://wa.me/919544464144?text=${encodeURIComponent("Hi! I'd like to upgrade my SlipGen plan to remove the watermark from my name slips.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--border)] transition-all hover:border-green-500 group"
                style={{ background: "var(--surface)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-[var(--text-muted)] group-hover:border-green-500" />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-white">Remove Watermark</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-1" style={{ background: "rgba(37, 211, 102, 0.1)", color: "#25D366" }}>
                  💬 Upgrade to Basic
                </span>
              </a>

              <a
                href={`https://wa.me/919544464144?text=${encodeURIComponent("Hi! I'd like to upgrade my SlipGen plan to add my own custom watermark/logo on name slips.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--border)] transition-all hover:border-green-500 group"
                style={{ background: "var(--surface)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-[var(--text-muted)] group-hover:border-green-500" />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-white">Add Custom Watermark</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-1" style={{ background: "rgba(37, 211, 102, 0.1)", color: "#25D366" }}>
                  💬 Upgrade to Standard
                </span>
              </a>
            </>
          ) : userPlan === 'basic' ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--success)]" style={{ background: "rgba(16, 185, 129, 0.08)" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
                  <span className="text-sm font-medium">Watermark Removed</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                  Basic Plan
                </span>
              </div>
              <a
                href={`https://wa.me/919544464144?text=${encodeURIComponent("Hi! I'm on the Basic plan and I'd like to upgrade to Standard to add my own custom watermark.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--border)] transition-all hover:border-green-500 group"
                style={{ background: "var(--surface)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-[var(--text-muted)] group-hover:border-green-500" />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-white">Add Custom Watermark</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-1" style={{ background: "rgba(37, 211, 102, 0.1)", color: "#25D366" }}>
                  💬 Upgrade
                </span>
              </a>
            </>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--success)]" style={{ background: "rgba(16, 185, 129, 0.08)" }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
                <span className="text-sm font-medium">Custom Watermark Unlocked</span>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                Standard Plan
              </span>
            </div>
          )}
        </div>
      </div>

      {lastFileSize !== null && (
        <p className="text-xs text-center mb-3" style={{ color: "var(--text-muted)" }}>
          File size: <span className="font-semibold" style={{ color: "var(--success)" }}>{formatBytes(lastFileSize)}</span>
        </p>
      )}

      {exportError && (
        <div className="p-3 rounded-lg text-xs mb-3" style={{ background: "rgba(239,68,68,0.08)", color: "var(--error)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {exportError}
        </div>
      )}

      <div className="step-actions flex-col">
        <button
          onClick={handleExport}
          disabled={isExporting || !layoutResult}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"
        >
          {isExporting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : exported ? (
            <><CheckCircle2 className="w-4 h-4" /> Exported Successfully!</>
          ) : (
            <><Download className="w-4 h-4" /> Export {exportFormat.toUpperCase()}</>
          )}
        </button>

        {exported && (
          <button onClick={handleExport} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export Again
          </button>
        )}

        <button onClick={() => setStep("layout")} className="btn-secondary w-full flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Layout
        </button>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Approximate the byte length of a base64 data URL (only used for the PNG image
// download path, where we don't have a Blob handy).
function approximateDataUrlByteLength(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(",");
  const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const padding = (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
  return Math.floor((b64.length * 3) / 4) - padding;
}
