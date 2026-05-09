"use client";

import { useState, useCallback } from "react";
import { useSlipGenStore } from "@/lib/store";
import { ArrowLeft, Download, FileText, Image as ImageIcon, Loader2, CheckCircle2, Lock } from "lucide-react";

export default function ExportPanel() {
  const { students, selectedTemplate, layoutConfig, layoutResult, setStep, isExporting, setIsExporting } = useSlipGenStore();
  const [exportFormat, setExportFormat] = useState<"pdf" | "png">("pdf");
  const [exportDpi, setExportDpi] = useState(300);
  const [exported, setExported] = useState(false);

  const handleExport = useCallback(async () => {
    if (!selectedTemplate || !layoutResult) return;
    setIsExporting(true);
    setExported(false);

    try {
      // Dynamic import for PDF generation
      const { default: jsPDF } = await import("jspdf");
      const { toPng } = await import("html-to-image");



      // Get the preview element
      const previewEl = document.getElementById("layout-preview-canvas");
      if (!previewEl) {
        alert("Preview not found. Please ensure the preview is visible.");
        setIsExporting(false);
        return;
      }

      const imgData = await toPng(previewEl, {
        pixelRatio: exportDpi / 96,
        backgroundColor: "#ffffff",
        style: { transform: "scale(1)", transformOrigin: "top left" }
      });

      if (exportFormat === "png") {
        const link = document.createElement("a");
        link.download = `slipgen-export-${Date.now()}.png`;
        link.href = imgData;
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: layoutConfig.paperSize === "A4" ? "portrait" : "portrait",
          unit: "mm",
          format: layoutConfig.paperSize === "13x19" ? [330, 483] : layoutConfig.paperSize.toLowerCase() as "a4" | "a3",
        });

        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
        pdf.save(`slipgen-export-${Date.now()}.pdf`);
      }

      setExported(true);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [selectedTemplate, layoutResult, layoutConfig, exportFormat, exportDpi, setIsExporting]);

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
            <ImageIcon className="w-4 h-4" /> PNG
          </button>
        </div>
      </div>

      {/* DPI */}
      <div className="mb-5">
        <label className="text-sm font-medium mb-2 block">Resolution (DPI)</label>
        <div className="grid grid-cols-3 gap-2">
          {[150, 300, 600].map((dpi) => (
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
          {exportDpi >= 300 ? "Print quality" : "Screen quality"}
        </p>
      </div>

      {/* Watermark Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Watermark</label>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--primary)]" style={{ background: "rgba(99,102,241,0.1)" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-medium">SlipGen Logo</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>Free</span>
          </div>

          <button onClick={() => alert("Upgrade to Basic Plan for ₹99 to remove watermark!")} className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--border)] transition-all hover:border-[var(--primary)] group" style={{ background: "var(--surface)" }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-[var(--text-muted)] group-hover:border-[var(--primary)]" />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-white">Remove Watermark</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-1" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}><Lock className="w-3 h-3" /> ₹99</span>
          </button>

          <button onClick={() => alert("Upgrade to Basic Plan for ₹99 to add your own watermark!")} className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--border)] transition-all hover:border-[var(--primary)] group" style={{ background: "var(--surface)" }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-[var(--text-muted)] group-hover:border-[var(--primary)]" />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-white">Add Custom Watermark</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-1" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}><Lock className="w-3 h-3" /> ₹99</span>
          </button>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !layoutResult}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mb-4 disabled:opacity-50"
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
