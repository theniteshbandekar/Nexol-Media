"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { blogCategories, type BlogPostCategory } from "@/lib/blog-format";
import type { AdminAuthor, AdminBlogPost } from "@/lib/firebase/admin-content";
import {
  createBlogPost,
  deleteBlogPost,
  saveBlogPost,
} from "@/lib/actions/admin/blog";

import { NumberField, SelectField, TextArea, TextField, Toggle } from "../fields";
import { BlogHeroField } from "../blog-hero-field";
import { BlogBodyField } from "../blog-body-field";
import { SaveBar } from "../save-bar";
import type { SaveStatus } from "../use-editor-form";

const CATEGORY_OPTIONS = blogCategories
  .filter((c): c is BlogPostCategory => c !== "All")
  .map((c) => ({ value: c, label: c }));

export function BlogEditor({
  initial,
  authors,
  mode,
}: {
  initial: AdminBlogPost;
  authors: AdminAuthor[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [value, setValue] = useState<AdminBlogPost>(initial);
  const baseline = useRef(JSON.stringify(initial));
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [status, setStatus] = useState<SaveStatus>({ type: "idle" });

  const dirty = mode === "create" || JSON.stringify(value) !== baseline.current;
  const uploadBase = `images/blog/${value.slug || "untitled"}`;

  function set<K extends keyof AdminBlogPost>(key: K, v: AdminBlogPost[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
    setStatus({ type: "idle" });
  }

  function setAuthor(id: string) {
    const a = authors.find((x) => x.id === id);
    setValue((prev) => ({
      ...prev,
      authorId: id,
      author: a
        ? { name: a.name, role: a.role, initials: a.initials }
        : prev.author,
    }));
    setStatus({ type: "idle" });
  }

  function onPrimary() {
    setStatus({ type: "idle" });
    startSave(async () => {
      const result =
        mode === "create" ? await createBlogPost(value) : await saveBlogPost(value);
      if (result.ok) {
        if (mode === "create") {
          router.push(`/admin/blog/${value.slug}`);
          router.refresh();
        } else {
          baseline.current = JSON.stringify(value);
          setStatus({ type: "saved" });
        }
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  function onDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    startDelete(async () => {
      const result = await deleteBlogPost(value.slug);
      if (result.ok) {
        router.push("/admin/blog");
        router.refresh();
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  return (
    <div className="adm-editor">
      <h1>{mode === "create" ? "New blog post" : value.title || value.slug}</h1>

      <section className="adm-section">
        <h2>Basics</h2>
        {mode === "create" ? (
          <TextField
            label="Slug"
            hint="URL path: /blog/<slug>. Lowercase, dashes."
            value={value.slug}
            onChange={(v) => set("slug", v)}
          />
        ) : (
          <div className="adm-field">
            <span className="adm-label">Slug</span>
            <span className="adm-hint">/blog/{value.slug}</span>
          </div>
        )}
        <TextField label="Title" value={value.title} onChange={(v) => set("title", v)} />
        <TextArea
          label="Dek"
          hint="One-sentence summary shown in listings and meta description."
          value={value.dek}
          onChange={(v) => set("dek", v)}
        />
        <div className="adm-row">
          <SelectField
            label="Category"
            value={value.category}
            options={CATEGORY_OPTIONS}
            onChange={(v) => set("category", v)}
          />
          {authors.length > 0 ? (
            <SelectField
              label="Author"
              value={value.authorId}
              options={authors.map((a) => ({ value: a.id, label: a.name }))}
              onChange={setAuthor}
            />
          ) : (
            <div className="adm-field">
              <span className="adm-label">Author</span>
              <span className="adm-hint">No authors yet — add one in Authors first.</span>
            </div>
          )}
        </div>
      </section>

      <section className="adm-section">
        <h2>Hero</h2>
        <BlogHeroField
          value={value.hero}
          onChange={(h) => set("hero", h)}
          uploadPath={`${uploadBase}/hero`}
        />
      </section>

      <section className="adm-section">
        <h2>Content</h2>
        <BlogBodyField
          value={value.body}
          onChange={(b) => set("body", b)}
          uploadPath={uploadBase}
        />
      </section>

      <section className="adm-section">
        <h2>Publishing</h2>
        <div className="adm-row">
          <TextField
            label="Published date"
            hint="ISO date, e.g. 2026-02-14. Used for sorting."
            value={value.publishedAt}
            onChange={(v) => set("publishedAt", v)}
          />
          <TextField
            label="Modified date"
            hint="Optional ISO date. Defaults to the published date."
            value={value.modifiedAt ?? ""}
            onChange={(v) => set("modifiedAt", v || undefined)}
          />
        </div>
        <NumberField
          label="Read time (minutes)"
          value={value.readTimeMinutes}
          onChange={(v) => set("readTimeMinutes", v)}
        />
        <TextField
          label="Tags"
          hint="Comma-separated."
          value={value.tags.join(", ")}
          onChange={(v) =>
            set(
              "tags",
              v.split(",").map((t) => t.trim()).filter(Boolean),
            )
          }
        />
        <Toggle
          label="Featured"
          hint="Pin to the featured slot on the blog index."
          value={value.featured ?? false}
          onChange={(v) => set("featured", v)}
        />
        <Toggle
          label="Published"
          hint="Off = hidden from the public site (draft)."
          value={value.published}
          onChange={(v) => set("published", v)}
        />
      </section>

      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        onSave={onPrimary}
        saveLabel={mode === "create" ? "Create post" : "Save"}
        viewHref={mode === "edit" ? `/blog/${value.slug}` : undefined}
        onDelete={mode === "edit" ? onDelete : undefined}
        deleting={deleting}
      />
    </div>
  );
}
