"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useSyncExternalStore } from "react";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  subscribeToConsent,
} from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Mounts GA4 + Microsoft Clarity ONLY after the user accepts analytics
 * via the cookie banner. Re-renders when consent changes (no reload needed).
 *
 * If no GA / Clarity env var is set, this component renders nothing —
 * useful for local dev before credentials are wired.
 */
export function Analytics() {
  const state = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  if (state !== "all") return null;

  return (
    <>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      {CLARITY_ID && <Clarity id={CLARITY_ID} />}
    </>
  );
}

/** Microsoft Clarity loader — official snippet, idempotent. */
function Clarity({ id }: { id: string }) {
  useEffect(() => {
    const w = window as unknown as {
      clarity?: ((..._args: unknown[]) => void) & { q?: unknown[] };
    };
    if (w.clarity) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] =
        c[a] ||
        function (...args: unknown[]) {
          (c[a].q = c[a].q || []).push(args);
        };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = `https://www.clarity.ms/tag/${i}`;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode?.insertBefore(t, y);
    })(window, document, "clarity", "script", id);
  }, [id]);

  return null;
}
