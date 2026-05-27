import Link from "next/link";

import type { HomeHook } from "@/lib/sanity/home-page";

export function HookSection({ hook }: { hook: HomeHook }) {
  const { h2, secondaryLinks } = hook;
  return (
    <section className="hook" id="hook" aria-label="Hook">
      <h2 className="hook-line">
        {h2.before}
        {h2.accent && <span className="accent">{h2.accent}</span>}
        {h2.after}
      </h2>
      {secondaryLinks.length > 0 && (
        <p
          style={{
            marginTop: 24,
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
          }}
        >
          {secondaryLinks.map((link, i) => (
            <span key={`${link.label}-${i}`}>
              <Link
                href={link.href}
                style={{ borderBottom: "1px solid var(--border-strong)" }}
              >
                {link.label}
              </Link>
              {i < secondaryLinks.length - 1 && " · "}
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
