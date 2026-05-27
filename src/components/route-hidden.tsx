import Link from "next/link";

export function RouteHidden({ label }: { label: string }) {
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
        {label} · Temporarily unavailable
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
        Back soon<span style={{ color: "var(--accent)" }}>.</span>
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
        This section is on a quick break while we put new work together. The
        rest of the site is still up — pick where you&rsquo;d like to go.
      </p>
      <div
        style={{
          marginTop: 40,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link className="btn-primary" href="/">
          Back to home
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
