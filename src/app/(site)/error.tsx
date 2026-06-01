"use client";

import Link from "next/link";
import { useEffect } from "react";

// Branded error boundary for the public site (Next.js requires this to be a client
// component). Catches unhandled runtime errors in (site) pages so visitors see a
// styled fallback instead of the default error screen.
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site error]", error);
  }, [error]);

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "var(--page-max)",
        margin: "0 auto",
        padding: "96px var(--page-gutter) 120px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          marginBottom: 24,
        }}
      >
        Something went wrong
      </p>
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "clamp(44px, 6vw, 88px)",
          fontWeight: 600,
          lineHeight: 0.96,
          letterSpacing: "var(--ls-display)",
          color: "var(--fg)",
          maxWidth: "20ch",
          textWrap: "balance",
        }}
      >
        This page hit a snag<span style={{ color: "var(--accent)" }}>.</span>
      </h1>
      <p
        style={{
          marginTop: 24,
          maxWidth: "56ch",
          fontSize: 18,
          lineHeight: 1.55,
          color: "var(--fg-muted)",
        }}
      >
        Something on our end broke while loading this page. Try again, or head back
        home — and if it keeps happening, let us know.
      </p>
      <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button className="btn-primary" type="button" onClick={() => reset()}>
          Try again
        </button>
        <Link
          href="/"
          className="tag-pill"
          style={{ height: 44, padding: "0 18px", fontSize: 13 }}
        >
          Back home
        </Link>
        <Link
          href="/contact"
          className="tag-pill"
          style={{ height: 44, padding: "0 18px", fontSize: 13 }}
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
