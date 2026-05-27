"use client";

import { useEffect } from "react";

/**
 * Mounts Sanity's visual-editing overlay client-side. Only rendered by
 * `(site)/layout.tsx` when Next.js draft mode is active (after a
 * successful round-trip through `/api/draft-mode/enable`).
 *
 * The overlay reads `data-sanity` attributes (via Sanity's `createDataAttribute`
 * helper) and lets editors click any tagged element to open it in the Studio's
 * Presentation panel.
 */
export function VisualEditingMount() {
  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { enableVisualEditing } = await import("@sanity/visual-editing");
        if (cancelled) return;
        dispose = enableVisualEditing();
      } catch (err) {
        console.warn("[visual-editing] Failed to enable overlay.", err);
      }
    })();
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return null;
}
