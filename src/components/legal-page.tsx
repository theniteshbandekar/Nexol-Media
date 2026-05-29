import type { ReactNode } from "react";
import Link from "next/link";

import type { LegalBlock, LegalPage } from "@/lib/sanity/legal-pages";

type LegalSpan = NonNullable<LegalBlock["children"]>[number];

function renderSpan(
  span: LegalSpan,
  markDefs: LegalBlock["markDefs"],
  key: string
): ReactNode {
  let node: ReactNode = span.text ?? "";
  for (const mark of span.marks ?? []) {
    if (mark === "strong") {
      node = (
        <strong style={{ color: "var(--fg)", fontWeight: 600 }}>{node}</strong>
      );
    } else if (mark === "em") {
      node = <em>{node}</em>;
    } else {
      const href = markDefs?.find((d) => d._key === mark)?.href;
      if (href) {
        node = href.startsWith("http") ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ borderBottom: "1px solid var(--gray-300)" }}
          >
            {node}
          </a>
        ) : (
          <Link href={href} style={{ borderBottom: "1px solid var(--gray-300)" }}>
            {node}
          </Link>
        );
      }
    }
  }
  return <span key={key}>{node}</span>;
}

function renderChildren(block: LegalBlock): ReactNode {
  return (block.children ?? []).map((span, i) =>
    renderSpan(span, block.markDefs, `${block._key ?? "b"}-${i}`)
  );
}

// Minimal Portable-Text-style renderer for the LegalBlock shape: switch on
// `style` (h2/h3/normal), group consecutive `listItem` blocks into ul/ol, and
// apply strong/em/link marks. Styles mirror the previous @portabletext/react
// component map so output is unchanged.
function renderBlocks(blocks: LegalBlock[]): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    const li = block.listItem;

    if (li === "bullet" || li === "number") {
      const items: LegalBlock[] = [];
      while (i < blocks.length && blocks[i].listItem === li) {
        items.push(blocks[i]);
        i++;
      }
      const liNodes = items.map((it, j) => (
        <li key={it._key ?? `li-${j}`} style={{ margin: "6px 0", lineHeight: 1.6 }}>
          {renderChildren(it)}
        </li>
      ));
      const listStyle = {
        margin: "16px 0 16px 22px",
        padding: 0,
        listStyle: li === "number" ? "decimal" : "disc",
        color: "var(--gray-700)",
      } as const;
      out.push(
        li === "number" ? (
          <ol key={block._key ?? `list-${i}`} style={listStyle}>
            {liNodes}
          </ol>
        ) : (
          <ul key={block._key ?? `list-${i}`} style={listStyle}>
            {liNodes}
          </ul>
        )
      );
      continue;
    }

    const key = block._key ?? `b-${i}`;
    const children = renderChildren(block);
    if (block.style === "h2") {
      out.push(
        <h2
          key={key}
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
      );
    } else if (block.style === "h3") {
      out.push(
        <h3
          key={key}
          style={{ margin: "24px 0 12px", fontSize: 18, fontWeight: 600, color: "var(--fg)" }}
        >
          {children}
        </h3>
      );
    } else {
      out.push(
        <p
          key={key}
          style={{ margin: "16px 0", fontSize: 16, lineHeight: 1.6, color: "var(--gray-700)" }}
        >
          {children}
        </p>
      );
    }
    i++;
  }
  return out;
}

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
          renderBlocks(page.body)
        ) : (
          <p style={{ color: "var(--fg-muted)", fontSize: 15 }}>
            Full policy content is being prepared in the admin.
          </p>
        )}
      </div>
    </article>
  );
}
