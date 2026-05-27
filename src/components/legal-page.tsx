import Link from "next/link";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { LegalPage } from "@/lib/sanity/legal-pages";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2
        style={{
          margin: "40px 0 16px",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(22px, 2.2vw, 28px)",
          fontWeight: 600,
          letterSpacing: "var(--ls-headline)",
          color: "var(--fg)",
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          margin: "24px 0 12px",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--fg)",
        }}
      >
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p style={{ margin: "16px 0", fontSize: 16, lineHeight: 1.6, color: "var(--gray-700)" }}>
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul
        style={{
          margin: "16px 0 16px 22px",
          padding: 0,
          listStyle: "disc",
          color: "var(--gray-700)",
        }}
      >
        {children}
      </ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li style={{ margin: "6px 0", lineHeight: 1.6 }}>{children}</li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong style={{ color: "var(--fg)", fontWeight: 600 }}>{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = href.startsWith("http");
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ borderBottom: "1px solid var(--gray-300)" }}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href}
          style={{ borderBottom: "1px solid var(--gray-300)" }}
        >
          {children}
        </Link>
      );
    },
  },
};

export function LegalPageBody({ page }: { page: LegalPage }) {
  return (
    <article
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 760,
        margin: "0 auto",
        padding: "96px var(--page-gutter) 120px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--fg-muted)",
          marginBottom: 16,
        }}
      >
        Legal · {page.kind === "privacy" ? "Privacy policy" : "Terms of service"}
      </p>
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "clamp(40px, 5vw, 72px)",
          fontWeight: 600,
          lineHeight: 1.0,
          letterSpacing: "var(--ls-display)",
          color: "var(--fg)",
        }}
      >
        {page.title}
      </h1>
      {page.lastUpdated && (
        <p
          style={{
            marginTop: 16,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--fg-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Last updated · {page.lastUpdated.slice(0, 10)}
        </p>
      )}
      {page.intro && (
        <p
          style={{
            marginTop: 28,
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--fg-muted)",
            maxWidth: "62ch",
          }}
        >
          {page.intro}
        </p>
      )}
      <div style={{ marginTop: 40 }}>
        {page.body.length > 0 ? (
          <PortableText value={page.body} components={components} />
        ) : (
          <p style={{ color: "var(--fg-muted)", fontSize: 15 }}>
            Full policy content is being prepared in the admin.
          </p>
        )}
      </div>
    </article>
  );
}
