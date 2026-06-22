"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { parseMarkdownPost } from "@/lib/blog-import";
import { createBlogPost } from "@/lib/actions/admin/blog";
import type { AdminAuthor, AdminBlogPost } from "@/lib/firebase/admin-content";

export function BlogImportBtn({ authors }: { authors: AdminAuthor[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, start] = useTransition();
  const router = useRouter();

  function openPicker() {
    setError(null);
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseMarkdownPost(text);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const parsed = result.post;

      // Resolve author: match by ID first, then fall back to first author.
      const author =
        authors.find((a) => a.id === parsed.authorId) ?? authors[0];

      const resolvedAuthor = author
        ? { name: author.name, role: author.role, initials: author.initials }
        : (parsed.author ?? { name: "", role: "", initials: "" });

      const post: AdminBlogPost = {
        slug: parsed.slug ?? "",
        title: parsed.title ?? "",
        dek: parsed.dek ?? "",
        category: parsed.category ?? "Growth",
        publishedAt: parsed.publishedAt ?? new Date().toISOString().slice(0, 10),
        modifiedAt: parsed.modifiedAt,
        readTimeMinutes: parsed.readTimeMinutes ?? 5,
        author: resolvedAuthor,
        authorId: author?.id ?? parsed.authorId ?? "",
        tags: parsed.tags ?? [],
        hero: parsed.hero ?? { kind: "placeholder", label: "" },
        body: parsed.body ?? [{ kind: "p", text: "" }],
        featured: parsed.featured ?? false,
        published: parsed.published ?? false,
      };

      if (!post.slug) {
        setError("Frontmatter is missing a `slug` field.");
        return;
      }

      start(async () => {
        const r = await createBlogPost(post);
        if (r.ok) {
          router.push(`/admin/blog/${post.slug}`);
          router.refresh();
        } else {
          setError(r.error ?? "Import failed.");
        }
      });
    };
    reader.onerror = () => setError("Could not read the file.");
    reader.readAsText(file);
  }

  return (
    <div style={{ display: "contents" }}>
      <input
        ref={inputRef}
        type="file"
        accept=".md,text/markdown,text/plain"
        style={{ display: "none" }}
        onChange={onFile}
      />
      <button
        className="adm-btn adm-btn-ghost"
        onClick={openPicker}
        disabled={importing}
        style={{ minWidth: 110 }}
      >
        {importing ? "Importing…" : "Import .md"}
      </button>
      {error && (
        <p
          className="adm-hint"
          style={{
            color: "var(--error, #f55)",
            gridColumn: "1 / -1",
            marginTop: 6,
            whiteSpace: "pre-line",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
