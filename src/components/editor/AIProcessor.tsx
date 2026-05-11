/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback } from "react";
import { useSlipGenStore } from "@/lib/store";
import { processImageWithAI, softCartoonize, AIQuotaError } from "@/lib/ai-processor";
import { getPassionTheme } from "@/lib/templates";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, CheckCircle2, AlertCircle, Wand2, RotateCcw, Lock, Crown } from "lucide-react";

export default function AIProcessor() {
  const { students, updateStudent, setStep, userPlan } = useSlipGenStore();
  const [processing, setProcessing] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const processedCount = students.filter((s) => s.aiProcessed).length;
  const allProcessed = students.length > 0 && processedCount === students.length;

  // AI transform: Standard plan gets real AI (Pollinations); Free + Basic get client-side soft cartoon.
  const canUseRealAI = userPlan === 'standard';

  const processAll = useCallback(async () => {
    setProcessing(true);
    setQuotaError(null);

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      if (student.aiProcessed) continue;

      setCurrentIdx(i);
      updateStudent(student.id, { aiProcessing: true });

      try {
        let aiImageUrl: string;

        if (canUseRealAI) {
          aiImageUrl = await processImageWithAI(
            student.imageUrl || '',
            student.passion,
            student.name,
            student.gender || 'child'
          );
        } else {
          if (student.imageUrl) {
            aiImageUrl = await softCartoonize(student.imageUrl, student.passion);
          } else {
            aiImageUrl = student.imageUrl || '';
          }
        }

        updateStudent(student.id, {
          aiImageUrl: aiImageUrl || student.imageUrl,
          aiProcessing: false,
          aiProcessed: true,
        });
      } catch (err) {
        if (err instanceof AIQuotaError) {
          // Stop the run and tell the user — don't silently fall back when the
          // server has explicitly denied the request (auth, plan, or quota).
          setQuotaError(err.message);
          updateStudent(student.id, { aiProcessing: false });
          break;
        }
        console.error('AI processing failed for', student.name, err);
        updateStudent(student.id, {
          aiImageUrl: student.imageUrl,
          aiProcessing: false,
          aiProcessed: true,
        });
      }
    }

    setCurrentIdx(-1);
    setProcessing(false);
  }, [students, updateStudent, canUseRealAI]);

  const resetAll = () => {
    students.forEach((s) => {
      updateStudent(s.id, { aiImageUrl: null, aiProcessing: false, aiProcessed: false });
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>AI Magic ✨</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Transform student photos into cartoon/Pixar style</p>
      </div>

      {/* Plan Info Banner */}
      {canUseRealAI ? (
        <div className="glass-card p-4 mb-5" style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#10b981" }} />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: "#10b981" }}>AI Transform Unlocked</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Full Pixar/Disney-style 3D cartoon characters via AI. Each student gets a unique cartoon based on their passion!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4 mb-5" style={{ background: "rgba(99, 102, 241, 0.05)" }}>
          <div className="flex items-start gap-3">
            <Wand2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
            <div>
              <p className="text-sm font-medium mb-1">How it works</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Photos get a soft cartoon effect (color smoothing + warm tones). Upgrade to Standard for full AI Pixar/Disney transformation!
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" style={{ color: "var(--warning)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--warning)" }}>
                  AI Transform requires Standard plan
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======== AI MODEL SETTINGS (locked, coming soon) ======== */}
      <div className="glass-card p-4 mb-5 relative overflow-hidden" style={{ borderColor: "rgba(99, 102, 241, 0.2)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <h3 className="text-sm font-semibold">AI Model Settings</h3>
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)" }}>
            <Lock className="w-2.5 h-2.5" /> Coming Soon
          </span>
        </div>
        <div className="space-y-3 opacity-50 pointer-events-none select-none">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Passion / Dream (per student)</label>
            <select className="input-field" disabled defaultValue="">
              <option value="">Select passion...</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Gender (for AI cartoon)</label>
            <div className="flex gap-2">
              {(['male', 'female', 'child'] as const).map((g) => (
                <button key={g} disabled className="flex-1 py-2 rounded-lg text-xs font-medium border" style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                  {g === 'male' ? '👦 Boy' : g === 'female' ? '👧 Girl' : '🧒 Other'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] mt-3 flex items-start gap-1.5" style={{ color: "var(--text-muted)" }}>
          <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" />
          Per-student AI customization (passion-themed backgrounds + gender-aware cartoon generation) launches with the Basic & Pro plans soon.
        </p>
      </div>

      {/* Student Cards */}
      <div className="space-y-3 mb-5">
        {students.map((student, idx) => {
          const theme = getPassionTheme(student.passion);
          const isCurrentlyProcessing = processing && currentIdx === idx;
          return (
            <div key={student.id} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: "var(--surface-hover)" }}>
                  {student.imageUrl ? (
                    <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (<span className="text-2xl">👤</span>)}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  {isCurrentlyProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--primary)" }} />
                  ) : student.aiProcessed ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: "var(--success)" }} />
                  ) : (
                    <ArrowRight className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                  )}
                  <span className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>AI</span>
                </div>
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: student.aiImageUrl ? "transparent" : `${theme.color}15`, border: `2px dashed ${student.aiProcessed ? theme.color : 'var(--border)'}` }}>
                  {student.aiImageUrl ? (
                    <img src={student.aiImageUrl} alt="AI" className="w-full h-full object-cover" />
                  ) : (<span className="text-lg">{theme.icon}</span>)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{student.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded inline-block mt-0.5" style={{ background: `${theme.color}15`, color: theme.color }}>
                    {theme.icon} {student.passion || 'Other'}
                  </span>
                  {isCurrentlyProcessing && <p className="text-[10px] mt-1" style={{ color: "var(--primary)" }}>Transforming...</p>}
                  {student.aiProcessed && <p className="text-[10px] mt-1" style={{ color: "var(--success)" }}>✓ Done</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="p-3 rounded-lg flex items-start gap-2 mb-5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
          <p className="text-xs" style={{ color: "var(--warning)" }}>No students added. Go back to add students first.</p>
        </div>
      )}

      {quotaError && (
        <div className="p-3 rounded-lg flex items-start gap-2 mb-5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--error)" }} />
          <p className="text-xs" style={{ color: "var(--error)" }}>{quotaError}</p>
        </div>
      )}

      {!allProcessed && students.length > 0 && (
        <button onClick={processAll} disabled={processing} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mb-4">
          {processing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {canUseRealAI ? 'Generating AI cartoon' : 'Applying effect'} {currentIdx + 1}/{students.length}...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> {canUseRealAI ? 'Generate Cartoon Characters ✨' : 'Apply Cartoon Effect ✨'}</>
          )}
        </button>
      )}

      {allProcessed && (
        <div className="text-center p-3 rounded-lg mb-4" style={{ background: "rgba(16,185,129,0.08)" }}>
          <CheckCircle2 className="w-6 h-6 mx-auto mb-1" style={{ color: "var(--success)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--success)" }}>All photos transformed!</p>
          <button onClick={resetAll} className="text-xs mt-1 flex items-center gap-1 mx-auto" style={{ color: "var(--text-muted)" }}>
            <RotateCcw className="w-3 h-3" /> Re-process
          </button>
        </div>
      )}

      <div className="step-actions">
        <button onClick={() => setStep("students")} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => setStep("template")} className="btn-primary flex-1 flex items-center justify-center gap-2">
          Choose Template <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
