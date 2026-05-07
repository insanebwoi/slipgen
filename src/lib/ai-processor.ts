// ==========================================
// SlipGen - AI Image Processor
// ==========================================
// Real AI: Replicate face-to-sticker (needs $5 billing)
// Fallback: Soft cartoon effect (smooth skin + gentle colors)

import { getPassionTheme } from './templates';

export function getAIPrompt(passion: string): string {
  const prompts: Record<string, string> = {
    Doctor: 'a cute cartoon pixar disney 3d style kid dressed as a doctor with white coat and stethoscope, big eyes, smooth skin, smiling',
    Engineer: 'a cute cartoon pixar disney 3d style kid wearing hard hat as an engineer, big eyes, smooth skin, smiling',
    Scientist: 'a cute cartoon pixar disney 3d style kid in lab coat as a scientist, big eyes, smooth skin, smiling',
    Pilot: 'a cute cartoon pixar disney 3d style kid as a pilot with cap, big eyes, smooth skin, smiling',
    Artist: 'a cute cartoon pixar disney 3d style kid as an artist with paintbrush, big eyes, smooth skin, smiling',
    Teacher: 'a cute cartoon pixar disney 3d style kid as a teacher with books, big eyes, smooth skin, smiling',
    Athlete: 'a cute cartoon pixar disney 3d style kid as an athlete with medal, big eyes, smooth skin, smiling',
    Astronaut: 'a cute cartoon pixar disney 3d style kid as an astronaut, big eyes, smooth skin, smiling',
    Chef: 'a cute cartoon pixar disney 3d style kid as a chef with hat, big eyes, smooth skin, smiling',
    Musician: 'a cute cartoon pixar disney 3d style kid as a musician with guitar, big eyes, smooth skin, smiling',
    Writer: 'a cute cartoon pixar disney 3d style kid as a writer with book, big eyes, smooth skin, smiling',
    Designer: 'a cute cartoon pixar disney 3d style kid as a designer, big eyes, smooth skin, smiling',
    Police: 'a cute cartoon pixar disney 3d style kid as a police officer, big eyes, smooth skin, smiling',
    Firefighter: 'a cute cartoon pixar disney 3d style kid as a firefighter, big eyes, smooth skin, smiling',
    Other: 'a cute cartoon pixar disney 3d style kid, big eyes, smooth skin, cheerful, smiling',
  };
  return prompts[passion] || prompts.Other;
}

/**
 * Main entry: server AI → client soft-cartoon fallback
 */
export async function processImageWithAI(
  imageDataUrl: string,
  passion: string,
  studentName?: string,
  gender?: string
): Promise<string> {
  // Try server AI (Pollinations.ai FREE / fal.ai / Replicate)
  try {
    const resp = await fetch('/api/ai-process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageDataUrl,
        passion,
        prompt: getAIPrompt(passion),
        studentName: studentName || 'Student',
        gender: gender || 'child',
      }),
      signal: AbortSignal.timeout(90000), // 90s for Pollinations
    });
    const data = await resp.json();
    if (resp.ok && data.imageUrl) return data.imageUrl;
  } catch {
    // API unavailable
  }

  // Client-side soft cartoon effect (fallback)
  console.log('[AI] Using soft cartoon effect');
  return softCartoonize(imageDataUrl, passion);
}

/**
 * Soft cartoon effect — gentle transformation, NOT over-exposed.
 * Goal: smooth skin, slightly brighter colors, soft edges — NOT harsh posterization.
 * 
 * Steps:
 * 1. Heavy smoothing (removes pores/texture like 3D render)
 * 2. Gentle color quantization (NOT harsh posterization)
 * 3. Soft warm color boost (not over-saturated)
 * 4. Very subtle edge enhancement (not black outlines)
 * 5. Gentle passion-themed tint
 */
export function softCartoonize(dataUrl: string, passion: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxSize = 512;
        const s = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.round(img.width * s);
        const h = Math.round(img.height * s);

        const { canvas, ctx } = makeCanvas(w, h);
        ctx.drawImage(img, 0, 0, w, h);

        // ===== STEP 1: Heavy smoothing (3D render look — smooth skin) =====
        // Apply multiple blur passes for very smooth appearance
        let imgData = ctx.getImageData(0, 0, w, h);
        imgData = boxBlur(imgData, w, h, 3); // radius 3 = very smooth
        imgData = boxBlur(imgData, w, h, 2); // second pass
        ctx.putImageData(imgData, 0, 0);

        // ===== STEP 2: Gentle color quantization (soft cartoon, not harsh) =====
        imgData = ctx.getImageData(0, 0, w, h);
        gentleQuantize(imgData, 12); // 12 levels = gentle, not flat
        ctx.putImageData(imgData, 0, 0);

        // ===== STEP 3: Soft edge enhancement (NOT thick black outlines) =====
        // Get edges from original (pre-smooth) for subtle definition
        const edgeCanvas = makeCanvas(w, h);
        edgeCanvas.ctx.drawImage(img, 0, 0, w, h);
        const origData = edgeCanvas.ctx.getImageData(0, 0, w, h);
        const edges = detectEdges(origData, w, h);

        imgData = ctx.getImageData(0, 0, w, h);
        addSoftEdges(imgData, edges, w, h, 40, 0.3); // threshold 40, only 30% darkness
        ctx.putImageData(imgData, 0, 0);

        // ===== STEP 4: Gentle warm color boost via CSS filters =====
        const out = makeCanvas(w, h);
        // Gentle: slightly more saturated + warm, NOT over-exposed
        out.ctx.filter = 'saturate(1.15) contrast(1.05) brightness(1.02)';
        out.ctx.drawImage(canvas, 0, 0);
        out.ctx.filter = 'none';

        // ===== STEP 5: Very gentle passion-themed warm tint =====
        const theme = getPassionTheme(passion);
        out.ctx.globalAlpha = 0.04; // Very subtle
        out.ctx.fillStyle = theme.color;
        out.ctx.fillRect(0, 0, w, h);
        out.ctx.globalAlpha = 1;

        // ===== STEP 6: Slight warm skin tone boost =====
        imgData = out.ctx.getImageData(0, 0, w, h);
        warmSkinTones(imgData);
        out.ctx.putImageData(imgData, 0, 0);

        resolve(out.canvas.toDataURL('image/png', 0.95));
      } catch (err) {
        console.error('Cartoon effect error:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ==========================================
// Canvas Helpers
// ==========================================

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

/**
 * Box blur — smooths the image (removes texture, creates 3D-render feel)
 */
function boxBlur(data: ImageData, w: number, h: number, radius: number): ImageData {
  const src = data.data;
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(w - 1, Math.max(0, x + dx));
          const ny = Math.min(h - 1, Math.max(0, y + dy));
          const i = (ny * w + nx) * 4;
          r += src[i]; g += src[i + 1]; b += src[i + 2]; count++;
        }
      }
      const i = (y * w + x) * 4;
      out[i] = r / count;
      out[i + 1] = g / count;
      out[i + 2] = b / count;
      out[i + 3] = 255;
    }
  }
  return new ImageData(out, w, h);
}

/**
 * Gentle color quantization — reduces colors softly (not harsh posterization)
 * Uses more levels than typical posterization for a natural cartoon look
 */
function gentleQuantize(data: ImageData, levels: number) {
  const d = data.data;
  const step = 256 / levels;

  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.round(d[i] / step) * step;
    d[i + 1] = Math.round(d[i + 1] / step) * step;
    d[i + 2] = Math.round(d[i + 2] / step) * step;
  }
}

/**
 * Sobel edge detection
 */
function detectEdges(data: ImageData, w: number, h: number): Float32Array {
  const src = data.data;
  const edges = new Float32Array(w * h);

  const gray = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114;
  };

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = gray(x-1,y-1), t = gray(x,y-1), tr = gray(x+1,y-1);
      const l  = gray(x-1,y),                     r  = gray(x+1,y);
      const bl = gray(x-1,y+1), b = gray(x,y+1), br = gray(x+1,y+1);

      const gx = (-tl - 2*l - bl) + (tr + 2*r + br);
      const gy = (-tl - 2*t - tr) + (bl + 2*b + br);
      edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return edges;
}

/**
 * Soft edge darkening — only very subtle definition, NOT thick black outlines
 */
function addSoftEdges(
  data: ImageData, edges: Float32Array,
  w: number, h: number,
  threshold: number, maxDarkness: number
) {
  const d = data.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const edge = edges[idx];
      if (edge > threshold) {
        const darkness = Math.min(maxDarkness, ((edge - threshold) / 100) * maxDarkness);
        const i = idx * 4;
        d[i]     = Math.round(d[i] * (1 - darkness));
        d[i + 1] = Math.round(d[i + 1] * (1 - darkness));
        d[i + 2] = Math.round(d[i + 2] * (1 - darkness));
      }
    }
  }
}

/**
 * Warm skin tones gently — adds slight pink/warmth to skin-colored pixels
 * This gives the "Disney character" warm glow without over-exposing
 */
function warmSkinTones(data: ImageData) {
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];

    // Detect skin-like tones (warm reddish/yellowish)
    if (r > 120 && g > 80 && b > 50 && r > g && g > b * 0.8) {
      // Gentle warm boost on skin
      d[i]     = clamp(r + 5);  // Slight red
      d[i + 1] = clamp(g + 2);  // Tiny green
      d[i + 2] = clamp(b - 2);  // Slightly less blue = warmer
    }
  }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}
