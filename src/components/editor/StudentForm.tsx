/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { useSlipGenStore } from "@/lib/store";
import { Student } from "@/types";
import { compressImageFile } from "@/lib/image-compress";
import { Plus, Trash2, User, ArrowRight, Image as ImageIcon, X, ChevronDown, Pencil, Check, Loader2 } from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export default function StudentForm() {
  const { students, addStudent, updateStudent, removeStudent, setStep, schoolList } = useSlipGenStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", className: "", schoolName: "" });
  const [editForm, setEditForm] = useState({ name: "", className: "", schoolName: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressedKB, setCompressedKB] = useState<number | null>(null);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const student: Student = {
      id: generateId(), name: form.name.trim(), className: form.className.trim(),
      division: "", rollNo: "", subject: "", schoolName: form.schoolName.trim(),
      passion: "Other", gender: "child", imageUrl: previewImage, imageFile: imageFile,
      aiImageUrl: null, aiProcessing: false, aiProcessed: false,
    };
    addStudent(student);
    setForm({ name: "", className: "", schoolName: form.schoolName });
    setPreviewImage(null); setImageFile(null); setCompressedKB(null); setIsAdding(false);
  };

  const startEdit = (s: Student) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, className: s.className, schoolName: s.schoolName });
    setIsAdding(false);
  };

  const saveEdit = (id: string) => {
    if (!editForm.name.trim()) return;
    updateStudent(id, { name: editForm.name.trim(), className: editForm.className.trim(), schoolName: editForm.schoolName.trim() });
    setEditingId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 25 * 1024 * 1024) { alert("Image must be under 25 MB"); return; }
    // Compress to ~50 KB before storing. Phone-camera photos are 5-15 MB which
    // bloats the export DOM and reliably breaks html-to-image on iOS Safari.
    setImageFile(file);
    setCompressing(true);
    setCompressedKB(null);
    try {
      const result = await compressImageFile(file, { targetBytes: 50 * 1024 });
      setPreviewImage(result.dataUrl);
      setCompressedKB(Math.round(result.bytes / 1024));
    } catch {
      // Compression failed — fall back to the raw file so the upload still works.
      const fr = new FileReader();
      fr.onload = (ev) => setPreviewImage(ev.target?.result as string);
      fr.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const schoolSuggestions = schoolList.filter(
    (s) => s.toLowerCase().includes(form.schoolName.toLowerCase()) && s.toLowerCase() !== form.schoolName.toLowerCase()
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Add Students</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Enter student details &amp; upload photos for AI transformation</p>
      </div>

      {/* Student List */}
      {students.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
            {students.length} Student{students.length !== 1 ? "s" : ""}
          </p>
          {students.map((student) =>
            editingId === student.id ? (
              /* Inline Edit Form */
              <div key={student.id} className="glass-card p-4 animate-fade-in" style={{ borderColor: "var(--primary)", borderWidth: 1 }}>
                <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
                  <Pencil className="w-3 h-3" /> Editing
                </p>
                <div className="space-y-2.5">
                  <input type="text" className="input-field text-sm" placeholder="Student Name *" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
                  <input type="text" className="input-field text-sm" placeholder="Std (e.g. 5th)" value={editForm.className} onChange={(e) => setEditForm({ ...editForm, className: e.target.value })} />
                  <input type="text" className="input-field text-sm" placeholder="School Name" value={editForm.schoolName} onChange={(e) => setEditForm({ ...editForm, schoolName: e.target.value })} />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditingId(null)} className="btn-secondary flex-1 text-xs py-2">Cancel</button>
                  <button onClick={() => saveEdit(student.id)} disabled={!editForm.name.trim()} className="btn-primary flex-1 text-xs py-2 disabled:opacity-40 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            ) : (
              /* Student Card */
              <div key={student.id} className="glass-card flex items-center gap-3 p-3 group">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: student.imageUrl ? "transparent" : "var(--surface-hover)" }}>
                  {student.imageUrl ? (
                    <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{student.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {[student.className, student.schoolName].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <button onClick={() => startEdit(student)} className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(99,102,241,0.15)]" style={{ color: "var(--primary)" }} title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => removeStudent(student.id)} className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20" style={{ color: "var(--error)" }} title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Add Student Form */}
      {isAdding ? (
        <div className="glass-card p-5 mb-5 animate-fade-in">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" style={{ color: "var(--primary)" }} /> New Student
          </h3>

          {/* Photo Upload */}
          <div className="mb-4">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {compressing ? (
              <div className="w-20 h-20 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: "var(--surface-hover)", border: "1px dashed var(--border)" }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--primary)" }} />
              </div>
            ) : previewImage ? (
              <div className="flex flex-col items-center gap-1 mb-2">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => { setPreviewImage(null); setImageFile(null); setCompressedKB(null); }} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {compressedKB !== null && (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Optimised · <span style={{ color: "var(--success)" }}>{compressedKB} KB</span>
                  </span>
                )}
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-1.5 transition-colors hover:border-[var(--primary)]" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs">Upload Photo (optional)</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>auto-compressed to ~50 KB</span>
              </button>
            )}
          </div>

          <div className="mb-3">
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Student Name *</label>
            <input type="text" className="input-field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>

          <div className="mb-3">
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Std</label>
            <input type="text" className="input-field" placeholder="e.g., 5th" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
          </div>

          {/* School — Combo dropdown/input */}
          <div className="mb-3 relative">
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>School Name</label>
            <div className="relative">
              <input ref={schoolInputRef} type="text" className="input-field pr-8" placeholder="Type or select school..." value={form.schoolName}
                onChange={(e) => { setForm({ ...form, schoolName: e.target.value }); setShowSchoolDropdown(true); }}
                onFocus={() => setShowSchoolDropdown(true)}
                onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
              />
              {schoolList.length > 0 && (
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  onClick={() => { setShowSchoolDropdown(!showSchoolDropdown); schoolInputRef.current?.focus(); }}
                  style={{ color: "var(--text-muted)" }}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>

            {showSchoolDropdown && (schoolSuggestions.length > 0 || (schoolList.length > 0 && !form.schoolName)) && (
              <div className="absolute z-20 w-full mt-1 py-1 rounded-lg border max-h-36 overflow-auto"
                style={{ background: "var(--surface-elevated)", borderColor: "var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
              >
                {(form.schoolName ? schoolSuggestions : schoolList).map((school, i) => (
                  <button key={i} className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                    onMouseDown={(e) => { e.preventDefault(); setForm({ ...form, schoolName: school }); setShowSchoolDropdown(false); }}
                  >
                    🏫 {school}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="step-actions">
            <button onClick={() => { setIsAdding(false); setForm({ name: "", className: "", schoolName: form.schoolName }); setPreviewImage(null); setImageFile(null); }} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
            <button onClick={handleAdd} disabled={!form.name.trim()} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">Add Student</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <Plus className="w-4 h-4" /> Add Student
        </button>
      )}

      {students.length > 0 && !isAdding && (
        <div className="step-actions" style={{ marginTop: "1.25rem" }}>
          <button onClick={() => setStep("ai-process")} className="btn-primary w-full flex items-center justify-center gap-2">
            AI Magic ✨ <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
