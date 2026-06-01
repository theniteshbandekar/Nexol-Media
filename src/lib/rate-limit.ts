import "server-only";

import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

// Module-level store. NOTE: this is per-instance and resets on cold start, and
// App Hosting can run many instances (and scales to zero) — so this catches naive
// bursts against a single warm instance but is NOT robust protection against
// determined/distributed abuse. For that, move to a shared store (Firestore/Redis)
// or add a CAPTCHA (Cloudflare Turnstile) on the forms. Kept dependency-free and
// fail-open on purpose so it can never block a legitimate booking.
const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  if (buckets.size < 1000) return;
  for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
}

/** Fixed-window limiter. Returns ok=false once `limit` is exceeded in `windowMs`. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP from proxy headers; "unknown" when unavailable. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}
