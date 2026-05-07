// ==========================================
// SlipGen - Smart Layout Engine (CORE FEATURE)
// ==========================================

import {
  PaperSize,
  PaperDimensions,
  PAPER_SIZES,
  LayoutConfig,
  LayoutResult,
  GridPosition,
} from '@/types';

/**
 * Core layout engine that calculates optimal grid placement
 * of name slips on paper to minimize waste.
 *
 * Algorithm:
 * 1. Calculate usable area = paper - (2 × margin)
 * 2. Try both orientations (portrait/landscape) for slips
 * 3. For each orientation:
 *    a. cols = floor((usable_width + gap) / (slip_width + gap))
 *    b. rows = floor((usable_height + gap) / (slip_height + gap))
 *    c. total = cols × rows
 * 4. Pick orientation with maximum total
 * 5. Center the grid within usable area
 * 6. Return positions + waste metric
 */
export function calculateLayout(
  slipWidth: number,
  slipHeight: number,
  config: LayoutConfig
): LayoutResult {
  const paper = PAPER_SIZES[config.paperSize];
  const margin = config.margin;
  const gap = config.gap;
  const bleed = config.showBleedMargin ? config.bleedMargin : 0;

  // Effective slip size including bleed
  const effectiveSlipW = slipWidth + bleed * 2;
  const effectiveSlipH = slipHeight + bleed * 2;

  // Usable paper area
  const usableWidth = paper.width - margin * 2;
  const usableHeight = paper.height - margin * 2;

  // Try portrait orientation
  const portraitResult = calculateGrid(
    effectiveSlipW,
    effectiveSlipH,
    usableWidth,
    usableHeight,
    gap,
    margin
  );

  // Try landscape orientation (swap slip dimensions)
  const landscapeResult = calculateGrid(
    effectiveSlipH,
    effectiveSlipW,
    usableWidth,
    usableHeight,
    gap,
    margin
  );

  // Pick the better orientation
  const best =
    portraitResult.totalSlips >= landscapeResult.totalSlips
      ? portraitResult
      : landscapeResult;

  const isLandscape = best === landscapeResult;
  const finalSlipW = isLandscape ? effectiveSlipH : effectiveSlipW;
  const finalSlipH = isLandscape ? effectiveSlipW : effectiveSlipH;

  // Calculate waste
  const usedArea = best.totalSlips * finalSlipW * finalSlipH;
  const totalArea = paper.width * paper.height;
  const wastePercentage = ((totalArea - usedArea) / totalArea) * 100;

  return {
    ...best,
    wastePercentage: Math.round(wastePercentage * 10) / 10,
    usedArea,
    totalArea,
    paperSize: config.paperSize,
    slipWidth: finalSlipW,
    slipHeight: finalSlipH,
    rotated: isLandscape,
  };
}

function calculateGrid(
  slipW: number,
  slipH: number,
  usableW: number,
  usableH: number,
  gap: number,
  margin: number
): { positions: GridPosition[]; rows: number; cols: number; totalSlips: number } {
  // Calculate how many slips fit
  const cols = Math.floor((usableW + gap) / (slipW + gap));
  const rows = Math.floor((usableH + gap) / (slipH + gap));

  if (cols <= 0 || rows <= 0) {
    return { positions: [], rows: 0, cols: 0, totalSlips: 0 };
  }

  // Calculate total grid size
  const gridWidth = cols * slipW + (cols - 1) * gap;
  const gridHeight = rows * slipH + (rows - 1) * gap;

  // Center the grid within usable area
  const offsetX = margin + (usableW - gridWidth) / 2;
  const offsetY = margin + (usableH - gridHeight) / 2;

  // Generate positions
  const positions: GridPosition[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: offsetX + col * (slipW + gap),
        y: offsetY + row * (slipH + gap),
        row,
        col,
      });
    }
  }

  return {
    positions,
    rows,
    cols,
    totalSlips: rows * cols,
  };
}

/**
 * Generate layout for multiple copies of a single student's slip
 */
export function generateCopiesLayout(
  slipWidth: number,
  slipHeight: number,
  config: LayoutConfig
): LayoutResult[] {
  const layout = calculateLayout(slipWidth, slipHeight, config);
  return [layout]; // Single page for now; multi-page support later
}

/**
 * Calculate how many pages are needed for all students with copies
 */
export function calculatePagesNeeded(
  totalStudents: number,
  copiesPerStudent: number,
  slipsPerPage: number
): number {
  const totalSlips = totalStudents * copiesPerStudent;
  return Math.ceil(totalSlips / slipsPerPage);
}

/**
 * Get paper dimensions for a given paper size
 */
export function getPaperDimensions(paperSize: PaperSize): PaperDimensions {
  return PAPER_SIZES[paperSize];
}

/**
 * Convert mm to pixels at a given DPI
 */
export function mmToPixels(mm: number, dpi: number = 96): number {
  return (mm / 25.4) * dpi;
}

/**
 * Convert pixels to mm at a given DPI
 */
export function pixelsToMm(px: number, dpi: number = 96): number {
  return (px / dpi) * 25.4;
}
