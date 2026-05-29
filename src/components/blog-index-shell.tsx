"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  blogCategories,
  formatPostDate,
  type BlogCategory,
} from "@/lib/blog-format";
import type { BlogPost } from "@/lib/blog";

const toneClasses = ["tone-a", "tone-b", "tone-c", "tone-d", "tone-e", "tone-f"];

function SearchIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="4.5" />
      <path d="m12.5 12.5-3.2-3.2" />
    </svg>
  );
}

export function BlogIndexShell({ posts }: { posts: BlogPost[] }) {
  const searchParams = useSearchParams();
  const initialCategory = useMemo<BlogCategory>(() => {
    const fromUrl = searchParams.get("category");
    if (!fromUrl) return "All";
    const match = blogCategories.find(
      (c) => c.toLowerCase() === fromUrl.toLowerCase()
    );
    return match ?? "All";
  }, [searchParams]);

  const [category, setCategory] = useState<BlogCategory>(initialCategory);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (
        e.key === "Escape" &&
        document.activeElement === inputRef.current
      ) {
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.dek.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, category, query]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)),
    [filtered]
  );

  const reset = () => {
    setCategory("All");
    setQuery("");
  };

  const categoryCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { All: posts.length };
    for (const p of posts) counts[p.category] = (counts[p.category] ?? 0) + 1;
    return counts;
  }, [posts]);

  return (
    <>
      <div className="blog-filters" aria-label="Filter and search">
        <div className="filter-chips" role="group" aria-label="Categories">
          {blogCategories.map((c) => (
            <button
              key={c}
              type="button"
              className="filter-chip"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
              <span className="count">{categoryCounts[c] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="search-wrap">
          <SearchIcon />
          <input
            ref={inputRef}
            className="search-input"
            type="search"
            placeholder="Search essays, tactics, creators…"
            aria-label="Search essays"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>⌘ K</kbd>
        </div>
      </div>

      <section className="grid-section" aria-label="Latest essays">
        <div className="head">
          <h2>Latest essays.</h2>
          <span className="meta">
            Showing {sorted.length} of {posts.length}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-results">
            <h3>No essays match those filters.</h3>
            <p>
              {query
                ? `No results for "${query}"${
                    category !== "All" ? ` in ${category}` : ""
                  }.`
                : `Nothing tagged ${category} yet.`}
            </p>
            <button type="button" onClick={reset}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {sorted.map((p, i) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="blog-card"
                aria-label={`${p.title} — read essay`}
              >
                <div
                  className={`media ${toneClasses[i % toneClasses.length]}`}
                  aria-hidden="true"
                >
                  {p.hero.kind === "image" ? (
                    <Image
                      src={p.hero.src}
                      alt={p.hero.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 360px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span className="label">{p.hero.label}</span>
                  )}
                  <span className="tag">
                    <span className="dot" />
                    {p.category}
                  </span>
                </div>
                <div className="body">
                  <h3>{p.title}</h3>
                  <p className="dek">{p.dek}</p>
                  <div className="foot">
                    <span>
                      <span className="by">{p.author.name}</span> ·{" "}
                      {formatPostDate(p.publishedAt)}
                    </span>
                    <span>{p.readTimeMinutes} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
