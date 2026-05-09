// Per-key sliding-window rate limiter.
//
// In-memory; a single Next.js instance is the assumed deployment shape. If you
// scale to multiple instances behind a load balancer, swap this for Redis (the
// public API of `check()` stays the same).

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let sweepStarted = false;
function startSweep() {
  if (sweepStarted) return;
  sweepStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k);
    }
  }, SWEEP_INTERVAL_MS).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function check(key: string, limit: number, windowMs: number): RateLimitResult {
  startSweep();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfterSeconds: 0 };
}
