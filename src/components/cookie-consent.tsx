"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  subscribeToConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * Bottom-right consent banner. Renders only when consent state is "unset".
 * Uses `useSyncExternalStore` to read localStorage + listen for changes
 * without setState-in-effect anti-patterns.
 */
export function CookieConsent() {
  const state = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  if (state !== "unset") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
      style={{
        position: "fixed",
        zIndex: 70,
        right: "clamp(16px, 2vw, 24px)",
        bottom: "clamp(16px, 2vw, 24px)",
        maxWidth: 420,
        width: "calc(100vw - 32px)",
        background: "var(--bg-elev)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-lg)",
        padding: "20px 22px",
        fontFamily: "var(--font-sans)",
        color: "var(--fg)",
      }}
    >
      <div
        id="consent-title"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--fg-muted)",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "var(--accent)",
          }}
        />
        Cookies &amp; analytics
      </div>
      <p
        id="consent-body"
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--fg)",
        }}
      >
        We use cookies for essential features and{" "}
        <strong>privacy-respecting analytics</strong> (Google Analytics,
        Microsoft Clarity heatmaps) to understand which content lands. No
        tracking for ads. You can change this any time.
      </p>
      <p
        style={{
          margin: "10px 0 16px",
          fontSize: 12,
          color: "var(--fg-muted)",
          lineHeight: 1.5,
        }}
      >
        Read our{" "}
        <Link
          href="/privacy"
          style={{ borderBottom: "1px solid var(--gray-300)" }}
        >
          privacy policy
        </Link>{" "}
        for details.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => writeConsent("all")}
          className="btn-primary"
          style={{ flex: 1, justifyContent: "center" }}
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => writeConsent("necessary")}
          style={{
            flex: 1,
            height: 44,
            padding: "0 18px",
            borderRadius: "var(--r-pill)",
            border: "1px solid var(--border)",
            background: "var(--bg-elev)",
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Necessary only
        </button>
      </div>
    </div>
  );
}
