// Client-safe — no firebase-admin or server-only imports.
import type { BlogBlock, BlogHero } from "@/lib/blog";
import type { AdminBlogPost } from "@/lib/firebase/admin-content";
import type { BlogPostCategory } from "@/lib/blog-format";

const VALID_CATEGORIES: BlogPostCategory[] = [
  "Growth",
  "Editing",
  "AI tools",
  "Distribution",
  "Behind the scenes",
];

/** Parse `key: value` and `key: "quoted value"` lines. Splits on the FIRST colon only. */
function parseFrontmatter(yaml: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of yaml.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    if (!key || !/^\w+$/.test(key)) continue;
    let val = line.slice(colon + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/**
 * Always import the hero as `kind: "image"` with an empty src so the upload
 * button is visible in the editor right away. The placeholder label (when
 * present) becomes the alt-text hint. Users can start uploading immediately.
 */
function parseHero(raw: string): BlogHero {
  if (!raw || raw.startsWith("placeholder:")) {
    // Empty src → shows the upload picker in BlogHeroField
    return { kind: "image", src: "", alt: "" };
  }
  return { kind: "image", src: raw.trim(), alt: "" };
}

/** Split body into blank-line-separated chunks. */
function toChunks(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function parseChunk(chunk: string, isFirst: boolean): BlogBlock | null {
  const c = chunk.replace(/\r\n/g, "\n");
  const lines = c.split("\n");

  // h2
  if (c.startsWith("## ")) {
    return { kind: "h2", num: "00", text: c.slice(3).trim() };
  }

  // blockquote
  if (lines.every((l) => l.startsWith("> "))) {
    const content = lines.map((l) => l.slice(2));
    let by: string | undefined;
    const last = content[content.length - 1];
    if (last.startsWith("— ") || last.startsWith("– ") || last.startsWith("- ")) {
      by = last.slice(2).trim();
      content.pop();
    }
    return { kind: "quote", text: content.join("\n").trim(), by };
  }

  // ordered list
  if (lines.every((l) => /^\d+\.\s/.test(l))) {
    return {
      kind: "ol",
      items: lines.map((l) => l.replace(/^\d+\.\s+/, "")),
    };
  }

  // unordered list (- or *)
  if (lines.every((l) => /^[-*]\s/.test(l))) {
    return {
      kind: "ul",
      items: lines.map((l) => l.replace(/^[-*]\s+/, "")),
    };
  }

  // figure: ![alt](src) or ![alt](src "Caption")
  if (lines.length === 1 && c.startsWith("![")) {
    const m = c.match(/^!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)$/);
    if (m) {
      const [, alt, src, title] = m;
      const trimSrc = src.trim();
      if (trimSrc.startsWith("placeholder:")) {
        return {
          kind: "figure",
          placeholderLabel: trimSrc.slice(12).trim(),
          alt: alt || undefined,
          caption: title || undefined,
        };
      }
      return {
        kind: "figure",
        src: trimSrc,
        alt: alt || undefined,
        caption: title || alt || undefined,
      };
    }
  }

  // paragraph — collapse internal newlines to spaces
  const text = c.replace(/\n/g, " ").trim();
  if (!text) return null;
  return isFirst ? { kind: "p", text, dropCap: true } : { kind: "p", text };
}

/**
 * Extract frontmatter and body from a markdown string.
 *
 * Tolerant of:
 * - A blank line after the opening `---`
 * - Any line of 3 or more dashes as the closing delimiter (AI often outputs
 *   `------...` instead of exactly `---`)
 */
function splitFrontmatter(md: string): { fm: string; body: string } | null {
  const lines = md.split("\n");
  let i = 0;

  // Opening delimiter — any line of 3+ dashes
  if (!lines[i]?.match(/^-{3,}\s*$/)) return null;
  i++;

  // Optional blank line after opening ---
  if (lines[i] === "") i++;

  // Collect frontmatter lines until the next line of 3+ dashes
  const fmLines: string[] = [];
  while (i < lines.length && !lines[i].match(/^-{3,}\s*$/)) {
    fmLines.push(lines[i]);
    i++;
  }

  if (i >= lines.length) return null; // No closing delimiter found

  i++; // Skip closing delimiter

  return {
    fm: fmLines.join("\n"),
    body: lines.slice(i).join("\n").trim(),
  };
}

export type ParseResult =
  | { ok: true; post: Partial<AdminBlogPost> }
  | { ok: false; error: string };

export function parseMarkdownPost(markdown: string): ParseResult {
  try {
    const md = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const split = splitFrontmatter(md);
    if (!split) {
      return {
        ok: false,
        error:
          "No frontmatter found. The file must start with:\n---\nslug: …\ntitle: …\n---",
      };
    }

    const fm = parseFrontmatter(split.fm);
    const bodyRaw = split.body;

    // Body blocks
    const chunks = toChunks(bodyRaw);
    let firstPara = true;
    const body: BlogBlock[] = [];
    for (const chunk of chunks) {
      // Skip horizontal-rule lines (---, ***, === etc.) that AIs sometimes add
      if (/^[-*=]{3,}\s*$/.test(chunk)) continue;
      const block = parseChunk(chunk, firstPara);
      if (block) {
        if (block.kind === "p" && firstPara) firstPara = false;
        body.push(block);
      }
    }

    const cat = fm.category as BlogPostCategory;
    const category: BlogPostCategory = VALID_CATEGORIES.includes(cat)
      ? cat
      : "Growth";

    return {
      ok: true,
      post: {
        slug: fm.slug?.trim() ?? "",
        title: fm.title ?? "",
        dek: fm.dek ?? "",
        category,
        publishedAt:
          fm.publishedAt ?? new Date().toISOString().slice(0, 10),
        modifiedAt: fm.modifiedAt || undefined,
        readTimeMinutes: Number(fm.readTimeMinutes) || 5,
        authorId: fm.author?.trim() ?? "",
        author: { name: "", role: "", initials: "" },
        tags: fm.tags
          ? fm.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        hero: parseHero(fm.hero ?? ""),
        body: body.length ? body : [{ kind: "p", text: "" }],
        featured: fm.featured === "true",
        published: fm.published === "true",
      },
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
