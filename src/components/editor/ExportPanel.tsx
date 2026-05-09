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

export default function ExportPanel() {
  const { students, selectedTemplate, layoutConfig, layoutResult, setStep, isExporting, setIsExporting, userPlan } = useSlipGenStore();
  const [exportFormat, setExportFormat] = useState<"pdf" | "png">("pdf");
  const [exportDpi, setExportDpi] = useState(200);
  const [quality, setQuality] = useState<Quality>("high");
  const [exported, setExported] = useState(false);
  const [lastFileSize, setLastFileSize] = useState<number | null>(null);

  const handleExport = useCallback(async () => {
    if (!selectedTemplate || !layoutResult) return;
    setIsExporting(true);
    setExported(false);
    setLastFileSize(null);

    try {
      const { default: jsPDF } = await import("jspdf");
      const { toJpeg, toPng } = await import("html-to-image");

      const previewEl = document.getElementById("layout-preview-canvas");
      if (!previewEl) {
        alert("Preview not found. Please ensure the preview is visible.");
        setIsExporting(false);
        return;
      }

      const preset = QUALITY_PRESETS[quality];

      // Render the live DOM preview to an image at the chosen DPI.
      // pixelRatio controls the rasterization density (DPI / 96 CSS-px-per-inch).
      const captureOpts = {
        pixelRatio: exportDpi / 96,
        backgroundColor: "#ffffff",
        cacheBust: false,
        style: { transform: "scale(1)", transformOrigin: "top left" },
      };

      const imgData = preset.usePng
        ? await toPng(previewEl, captureOpts)
        : await toJpeg(previewEl, { ...captureOpts, quality: preset.jpegQuality });

      const imageMime = preset.usePng ? "PNG" : "JPEG";

      let outputBlobSize = 0;

      if (exportFormat === "png") {
        // Direct image download — no PDF wrapping.
        const link = document.createElement("a");
        const ext = preset.usePng ? "png" : "jpg";
        link.download = `slipgen-export-${Date.now()}.${ext}`;
        link.href = imgData;
        link.click();
        outputBlobSize = approximateDataUrlByteLength(imgData);
      } else {
        // jsPDF v4: compress=true enables zlib stream compression on top of the
        // already-compressed JPEG. Embedding JPEG inside PDF is the single biggest
        // size win — a 512-DPI A4 PNG is 8–15 MB, the same content as JPEG-95 is ~600 KB.
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: layoutConfig.paperSize === "13x19" ? [330, 483] : layoutConfig.paperSize.toLowerCase() as "a4" | "a3",
          compress: true,
        });

        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        // The fourth-to-last arg "alias" is undefined; the last "compression" hint
        // applies to PNG embeds — JPEGs ignore it but it's harmless to pass.
        pdf.addImage(imgData, imageMime, 0, 0, pdfW, pdfH, undefined, "FAST");

        const blob = pdf.output("blob");
        outputBlobSize = blob.size;

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `slipgen-export-${Date.now()}.pdf`;
        link.href = url;
        link.click();
        // Defer revoke so the download has time to start.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      setLastFileSize(outputBlobSize);
      setExported(true);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [selectedTemplate, layoutResult, layoutConfig, exportFormat, exportDpi, quality, setIsExporting]);

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
                  💬 Upgrade
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
                  💬 Upgrade
                </span>
              </a>
            </>
          ) : (
            <>
              {/* Basic / Standard: full watermark control — no upsells needed */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--success)]" style={{ background: "rgba(16, 185, 129, 0.08)" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--success)" }} />
                  <span className="text-sm font-medium">Custom Watermark</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                  {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Manage your watermark settings in the Layout step.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !layoutResult}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mb-2 disabled:opacity-50"
      >
        {isExporting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : exported ? (
          <><CheckCircle2 className="w-4 h-4" /> Exported Successfully!</>
        ) : (
          <><Download className="w-4 h-4" /> Export {exportFormat.toUpperCase()}</>
        )}
      </button>

      {lastFileSize !== null && (
        <p className="text-xs text-center mb-3" style={{ color: "var(--text-muted)" }}>
          File size: <span className="font-semibold" style={{ color: "var(--success)" }}>{formatBytes(lastFileSize)}</span>
        </p>
      )}

      {exported && (
        <button onClick={handleExport} className="btn-secondary w-full flex items-center justify-center gap-2 mb-4">
          <Download className="w-4 h-4" /> Export Again
        </button>
      )}

      <button onClick={() => setStep("layout")} className="btn-secondary w-full flex items-center justify-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Layout
      </button>
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
