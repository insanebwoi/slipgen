// ==========================================
// SlipGen - Zustand Store
// ==========================================

import { create } from 'zustand';
import { Student, Template, LayoutConfig, LayoutResult, EditorStep, UserPlan, WatermarkConfig } from '@/types';
import { templates } from '@/lib/templates';
import { calculateLayout } from '@/lib/layout-engine';

interface SlipGenStore {
  currentStep: EditorStep;
  setStep: (step: EditorStep) => void;

  projectTitle: string;
  setProjectTitle: (title: string) => void;

  // School list (auto-collected from students + manually added)
  schoolList: string[];
  addSchool: (name: string) => void;

  // Plan & Watermark
  userPlan: UserPlan;
  setUserPlan: (plan: UserPlan) => void;
  watermark: WatermarkConfig;
  setWatermark: (config: Partial<WatermarkConfig>) => void;

  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  removeStudent: (id: string) => void;
  setStudents: (students: Student[]) => void;

  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template) => void;

  layoutConfig: LayoutConfig;
  layoutResult: LayoutResult | null;
  setLayoutConfig: (config: Partial<LayoutConfig>) => void;
  recalculateLayout: () => void;

  isExporting: boolean;
  setIsExporting: (val: boolean) => void;

  resetProject: () => void;
}

const defaultLayoutConfig: LayoutConfig = {
  paperSize: 'A4',
  margin: 8,
  gap: 2,
  copies: 1,
  showCropMarks: true,
  showBleedMargin: false,
  bleedMargin: 3,
};

// SlipGen brand logo lives at /public/logo.png (any image format works — change the path if needed).
export const SLIPGEN_LOGO_URL = '/logo.png';

const defaultWatermark: WatermarkConfig = {
  enabled: true,
  type: 'logo',
  text: 'SlipGen',
  logoUrl: SLIPGEN_LOGO_URL,
  opacity: 0.15,
  position: 'bottom-right',
};

export const useSlipGenStore = create<SlipGenStore>((set, get) => ({
  currentStep: 'students',
  setStep: (step) => set({ currentStep: step }),

  projectTitle: '',
  setProjectTitle: (title) => set({ projectTitle: title }),

  // School list — auto-collected from student entries
  schoolList: [],
  addSchool: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.schoolList.some(s => s.toLowerCase() === trimmed.toLowerCase())) return state;
      return { schoolList: [...state.schoolList, trimmed] };
    });
  },

  // Plan defaults to 'free'
  userPlan: 'free',
  setUserPlan: (plan) => set({ userPlan: plan }),
  watermark: defaultWatermark,
  setWatermark: (config) =>
    set((state) => ({ watermark: { ...state.watermark, ...config } })),

  students: [],
  addStudent: (student) =>
    set((state) => {
      // Auto-add school to the list when a student is added
      const newList = [...state.schoolList];
      const school = student.schoolName?.trim();
      if (school && !newList.some(s => s.toLowerCase() === school.toLowerCase())) {
        newList.push(school);
      }
      return { students: [...state.students, student], schoolList: newList };
    }),
  updateStudent: (id, data) =>
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  removeStudent: (id) =>
    set((state) => ({ students: state.students.filter((s) => s.id !== id) })),
  setStudents: (students) => set({ students }),

  selectedTemplate: templates[0],
  setSelectedTemplate: (template) => {
    set({ selectedTemplate: template });
    const state = get();
    if (template) {
      const result = calculateLayout(template.width, template.height, state.layoutConfig);
      set({ layoutResult: result });
    }
  },

  layoutConfig: defaultLayoutConfig,
  layoutResult: null,
  setLayoutConfig: (config) => {
    set((state) => ({ layoutConfig: { ...state.layoutConfig, ...config } }));
    setTimeout(() => get().recalculateLayout(), 0);
  },
  recalculateLayout: () => {
    const state = get();
    if (state.selectedTemplate) {
      const result = calculateLayout(
        state.selectedTemplate.width,
        state.selectedTemplate.height,
        state.layoutConfig
      );
      set({ layoutResult: result });
    }
  },

  isExporting: false,
  setIsExporting: (val) => set({ isExporting: val }),

  resetProject: () =>
    set({
      currentStep: 'students',
      projectTitle: '',
      students: [],
      schoolList: [],
      selectedTemplate: templates[0],
      layoutConfig: defaultLayoutConfig,
      layoutResult: null,
      watermark: defaultWatermark,
    }),
}));
