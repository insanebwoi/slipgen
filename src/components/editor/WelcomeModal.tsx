"use client";

import { useEffect, useState } from "react";
import { useSlipGenStore } from "@/lib/store";
import { Student } from "@/types";
import { Sparkles, X, Users, Wand2, ArrowRight } from "lucide-react";

// Persistence key — bumped if we ever change the welcome flow so returning
// users see the new one once.
const STORAGE_KEY = "slipgen.welcome_seen.v1";

// Sample roster shown when the user clicks "Load sample class". Picked so each
// student has a distinct passion (drives the AI variation demo) and a mix of
// short/long names (tests SmartName wrapping in templates).
const SAMPLE_SCHOOL = "Greenwood Public School";
const SAMPLE_STUDENTS: Omit<Student, "id">[] = [
  { name: "Aanya Sharma",           className: "5", division: "A", rollNo: "01", subject: "Mathematics",  schoolName: SAMPLE_SCHOOL, passion: "Doctor",    gender: "female", imageUrl: null, imageFile: null, aiImageUrl: null, aiProcessing: false, aiProcessed: false },
  { name: "Rohan Mehta",            className: "5", division: "A", rollNo: "02", subject: "Science",      schoolName: SAMPLE_SCHOOL, passion: "Engineer",  gender: "male",   imageUrl: null, imageFile: null, aiImageUrl: null, aiProcessing: false, aiProcessed: false },
  { name: "Priya Krishnan",         className: "5", division: "A", rollNo: "03", subject: "English",      schoolName: SAMPLE_SCHOOL, passion: "Artist",    gender: "female", imageUrl: null, imageFile: null, aiImageUrl: null, aiProcessing: false, aiProcessed: false },
  { name: "Mohammed Ibrahim Khan",  className: "5", division: "A", rollNo: "04", subject: "Social Science", schoolName: SAMPLE_SCHOOL, passion: "Pilot",   gender: "male",   imageUrl: null, imageFile: null, aiImageUrl: null, aiProcessing: false, aiProcessed: false },
  { name: "Diya Patel",             className: "5", division: "A", rollNo: "05", subject: "Hindi",        schoolName: SAMPLE_SCHOOL, passion: "Astronaut", gender: "female", imageUrl: null, imageFile: null, aiImageUrl: null, aiProcessing: false, aiProcessed: false },
];

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export default function WelcomeModal() {
  const { students, setStudents } = useSlipGenStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on the very first visit to /editor when the workspace is empty.
    // We don't pester returning users — once dismissed, it stays gone.
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen && students.length === 0) {
        setVisible(true);
      }
    } catch {
      // localStorage blocked (private browsing) — still show, but it'll re-show
      // next session. Acceptable trade-off.
      if (students.length === 0) setVisible(true);
    }
    // We intentionally check students.length only on mount; if a returning user
    // has saved students load in, the modal stays dismissed even without the flag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    try { window.localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch { /* ignore */ }
    setVisible(false);
  };

  const loadSample = () => {
    setStudents(SAMPLE_STUDENTS.map((s) => ({ ...s, id: generateId() })));
    close();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in"
      style={{ background: "rgba(5, 5, 15, 0.72)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="glass-card w-full max-w-lg p-6 md:p-8 relative animate-fade-in-up"
        style={{ background: "rgba(20, 20, 32, 0.95)" }}
      >
        <button
          onClick={close}
          aria-label="Close welcome"
          className="absolute top-3 right-3 flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
          style={{ width: 32, height: 32, color: "var(--text-muted)" }}
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="inline-flex items-center justify-center mb-4 rounded-2xl animate-pulse-glow"
          style={{
            width: 56, height: 56,
            background: "var(--gradient-primary)",
          }}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        <h2 id="welcome-title" className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Welcome to <span className="gradient-text">SlipGen</span>
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Create beautiful, print-ready student name slips in three quick steps. Want a guided start, or jump straight in?
        </p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <StepRow num="1" icon={<Users className="w-4 h-4" />} title="Add students" body="Name, class, roll number — photo is optional." />
          <StepRow num="2" icon={<Wand2 className="w-4 h-4" />} title="Pick a template & layout" body="11+ designs from classic to anime to retro." />
          <StepRow num="3" icon={<ArrowRight className="w-4 h-4" />} title="Export to print" body="Print-ready PDF with smart paper packing." />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={loadSample}
            className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Load sample class
          </button>
          <button onClick={close} className="btn-secondary flex-1">
            Start from scratch
          </button>
        </div>

        <p className="text-[11px] mt-4 text-center" style={{ color: "var(--text-muted)" }}>
          Sample class adds 5 demo students you can edit or delete.
        </p>
      </div>
    </div>
  );
}

function StepRow({ num, icon, title, body }: { num: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--surface-elevated)" }}>
      <div
        className="flex items-center justify-center rounded-md flex-shrink-0 font-bold text-xs"
        style={{ width: 28, height: 28, background: "rgba(99, 102, 241, 0.18)", color: "var(--primary-light)" }}
      >
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span style={{ color: "var(--primary-light)" }}>{icon}</span>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>{body}</p>
      </div>
    </div>
  );
}
