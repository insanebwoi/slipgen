// ==========================================
// SlipGen - Type Definitions
// ==========================================

export interface Student {
  id: string;
  name: string;
  className: string;
  division: string;
  rollNo: string;
  subject: string;
  schoolName: string;
  passion: string;
  gender: 'male' | 'female' | 'child'; // For AI cartoon generation
  imageUrl: string | null;
  imageFile: File | null;
  aiImageUrl: string | null; // AI-generated cartoon/Pixar version
  aiProcessing: boolean;
  aiProcessed: boolean;
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  style: 'landscape-left' | 'landscape-center' | 'landscape-right';
  detailsPosition: 'right' | 'left' | 'bottom';
  detailsStyle: 'lined' | 'clean' | 'boxed';
  fontFamily: string;
  width: number;  // in mm (landscape)
  height: number; // in mm
}

export type Passion =
  | 'Doctor'
  | 'Engineer'
  | 'Teacher'
  | 'Scientist'
  | 'Artist'
  | 'Athlete'
  | 'Pilot'
  | 'Astronaut'
  | 'Chef'
  | 'Musician'
  | 'Writer'
  | 'Designer'
  | 'Police'
  | 'Firefighter'
  | 'Other';

export interface PassionTheme {
  passion: string;
  background: string; // path to background image
  color: string; // primary color
  icon: string; // emoji
}

export type PaperSize = 'A4' | 'A3' | '13x19';

export interface PaperDimensions {
  width: number;
  height: number;
  label: string;
}

export const PAPER_SIZES: Record<PaperSize, PaperDimensions> = {
  A4: { width: 210, height: 297, label: 'A4 (210 × 297 mm)' },
  A3: { width: 297, height: 420, label: 'A3 (297 × 420 mm)' },
  '13x19': { width: 330, height: 483, label: '13×19 (330 × 483 mm)' },
};

export interface LayoutConfig {
  paperSize: PaperSize;
  margin: number;
  gap: number;
  copies: number;
  autoFillPage: boolean;
  showCropMarks: boolean;
  showBleedMargin: boolean;
  bleedMargin: number;
}

export interface GridPosition {
  x: number;
  y: number;
  row: number;
  col: number;
}

export interface LayoutResult {
  positions: GridPosition[];
  rows: number;
  cols: number;
  totalSlips: number;
  wastePercentage: number;
  usedArea: number;
  totalArea: number;
  paperSize: PaperSize;
  slipWidth: number;
  slipHeight: number;
  rotated: boolean; // true when engine rotated the slip 90deg to fit more per page
}

export interface Project {
  id: string;
  title: string;
  schoolName: string;
  students: Student[];
  template: Template | null;
  layoutConfig: LayoutConfig;
  createdAt: Date;
  updatedAt: Date;
}

export type EditorStep = 'students' | 'template' | 'layout' | 'export';

export type UserPlan = 'free' | 'basic' | 'standard';

export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'logo';
  text: string;           // e.g. "SlipGen" or school name
  logoUrl: string | null;  // uploaded logo for basic/standard plans
  opacity: number;         // 0.05 - 0.3
  position: 'center' | 'bottom-right' | 'bottom-left';
}
