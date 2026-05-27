import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
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
        404 · Page not found
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
        That page is not here<span style={{ color: "var(--accent)" }}>.</span>
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
        The link is broken, the page moved, or it was never there. Try one of
        the routes below — these are where most visitors end up.
      </p>
      <div
        style={{
          marginTop: 40,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link className="btn-primary" href="/case-studies">
          See the case studies
        </Link>
        <Link
          href="/services"
          className="tag-pill"
          style={{ height: 44, padding: "0 18px", fontSize: 13 }}
        >
          Browse services
        </Link>
        <Link
          href="/blog"
          className="tag-pill"
          style={{ height: 44, padding: "0 18px", fontSize: 13 }}
        >
          Read the blog
        </Link>
        <Link
          href="/contact"
          className="tag-pill"
          style={{ height: 44, padding: "0 18px", fontSize: 13 }}
        >
          Send a brief
        </Link>
      </div>
    </div>
  );
}
