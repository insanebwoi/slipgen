// Client-side image compression. Used at upload time to keep student photos
// small (~50 KB target) so:
//  1. The store/export DOM stays under mobile WebKit's canvas memory ceiling
//     (large data: URIs are the #1 cause of "Export failed" on iPhone Safari).
//  2. PDF/PNG exports are smaller and decode faster.
//
// Strategy: downscale to a max edge, then re-encode JPEG with adaptive quality.
// We binary-search the quality dial against the target byte size. If we hit the
// quality floor and still can't fit, we accept the smallest result rather than
// fail — a slightly chunkier file is always better than no photo.

const DEFAULT_TARGET_BYTES = 50 * 1024; // 50 KB
const DEFAULT_MAX_EDGE = 768;           // px; enough for a 300 DPI 50mm slip photo
const QUALITY_FLOOR = 0.45;             // anything below this looks worse than no AI cartoon
const QUALITY_CEILING = 0.92;

export interface CompressResult {
  dataUrl: string;
  bytes: number;
  width: number;
  height: number;
  quality: number;
}

/**
 * Compress an uploaded image to a target byte size (default 50 KB).
 * Always resolves; never throws — failure path returns the original as a data URL.
 */
export async function compressImageFile(
  file: File,
  opts: { targetBytes?: number; maxEdge?: number } = {},
): Promise<CompressResult> {
  const targetBytes = opts.targetBytes ?? DEFAULT_TARGET_BYTES;
  const maxEdge = opts.maxEdge ?? DEFAULT_MAX_EDGE;

  // Decode the source file. createImageBitmap is faster + memory-cheaper than
  // <img>, and exists on both iOS Safari and Chrome.
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Decoder choked (corrupt, HEIC on Android without polyfill, etc.).
    // Fall back to the raw bytes — caller still gets *something*.
    const dataUrl = await fileToDataUrl(file);
    return { dataUrl, bytes: file.size, width: 0, height: 0, quality: 1 };
  }

  // Downscale so the longer edge ≤ maxEdge while preserving aspect ratio.
  const srcW = bitmap.width, srcH = bitmap.height;
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    const dataUrl = await fileToDataUrl(file);
    bitmap.close?.();
    return { dataUrl, bytes: file.size, width: srcW, height: srcH, quality: 1 };
  }
  // White background — JPEG has no alpha so transparent PNGs (rare for photos)
  // would otherwise leak black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  // Binary search quality 0.45..0.92 against target byte size.
  // 6 iterations is plenty — the search range narrows by 2× each step.
  let lo = QUALITY_FLOOR, hi = QUALITY_CEILING;
  let best: { dataUrl: string; bytes: number; quality: number } | null = null;
  for (let i = 0; i < 6; i++) {
    const q = (lo + hi) / 2;
    const dataUrl = canvas.toDataURL("image/jpeg", q);
    const bytes = approxByteLength(dataUrl);
    // Track the smallest result that still fits, OR the smallest overall.
    if (bytes <= targetBytes) {
      best = { dataUrl, bytes, quality: q };
      lo = q; // we have room to push quality up
    } else {
      hi = q; // too big — drop quality
      if (!best || bytes < best.bytes) best = { dataUrl, bytes, quality: q };
    }
  }

  // Final pass at the achieved quality to make sure `best` is set.
  if (!best) {
    const dataUrl = canvas.toDataURL("image/jpeg", QUALITY_FLOOR);
    best = { dataUrl, bytes: approxByteLength(dataUrl), quality: QUALITY_FLOOR };
  }

  return { dataUrl: best.dataUrl, bytes: best.bytes, width: w, height: h, quality: best.quality };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

// Estimate decoded byte length of a base64 data URL.
function approxByteLength(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(",");
  const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}
