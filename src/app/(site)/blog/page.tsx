import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import {
  formatPostDate,
  formatPostDateLong,
  getAllBlogPosts,
  getArchive,
  getFeaturedPost,
  getRecentPosts,
  isThinPost,
} from "@/lib/blog";
import { BlogIndexShell } from "@/components/blog-index-shell";
import { NewsletterCta } from "@/components/newsletter-cta";
import { JsonLd } from "@/components/json-ld";
import { RouteHidden } from "@/components/route-hidden";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import { itemListSchema } from "@/lib/schema";

import "./blog.css";

export const metadata: Metadata = {
  title: "Blog — Notes From Nexol Media",
  description:
    "Notes from Nexol Media on creator growth, editing, AI tools, distribution, and what we are testing inside the Mumbai bay. One honest essay every Sunday.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "Blog — Notes From Nexol Media",
    description:
      "Creator growth, editing, AI tools, distribution. One honest essay every Sunday from Nexol Media.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Notes From Nexol Media",
    description: "Creator growth, editing, AI tools, distribution.",
  },
};

function ArrowDiag() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10 10 4" />
      <path d="M5 4h5v5" />
    </svg>
  );
}

export default async function BlogPage() {
  const settings = await getSiteSettings();
  if (settings.routeVisibility.blog === false) {
    return <RouteHidden label="Blog" />;
  }

  const [featured, recentRaw, archiveRaw, allPosts] = await Promise.all([
    getFeaturedPost(),
    getRecentPosts(5),
    getArchive(),
    getAllBlogPosts(),
  ]);
  const recent = recentRaw.filter((p) => !isThinPost(p));
  const archive = archiveRaw.filter((p) => !isThinPost(p));
  const indexedPosts = allPosts.filter((p) => !isThinPost(p));

  const listSchema = itemListSchema(
    "Nexol Media · Essays",
    indexedPosts.map((p) => ({
      url: `/blog/${p.slug}`,
      name: p.title,
    }))
  );

  return (
    <div className="blog-page">
      <JsonLd schema={listSchema} />
      <header className="blog-header">
        <h1 className="fade-up">
          Notes From Nexol<span className="accent-dot">.</span>
        </h1>
        <p className="dek fade-up d1">
          Essays, tactics and frame-by-frame teardowns from inside the bay.
          One new essay every Sunday. No recycled threads.
        </p>
      </header>

      {featured && (
        <section className="featured-row" aria-label="Featured + recent">
          <Link
            className="featured-post fade-up d1"
            href={`/blog/${featured.slug}`}
          >
            <div className="media" aria-hidden="true">
              {featured.hero.kind === "image" ? (
                <Image
                  src={featured.hero.src}
                  alt={featured.hero.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 640px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <>
                  <span className="pulse" />
                  <span className="label">{featured.hero.label}</span>
                </>
              )}
            </div>
            <div className="body">
              <div className="pill-row">
                <span className="pill-tag">
                  <span className="dot" />
                  Featured · {featured.category}
                </span>
                <span className="pill-tag outline">
                  <span className="dot" />
                  {formatPostDateLong(featured.publishedAt)}
                </span>
              </div>
              <h2>{featured.title}</h2>
              <p className="dek">{featured.dek}</p>
              <div className="foot">
                <div className="author-row">
                  <span className="avatar">{featured.author.initials}</span>
                  <span className="meta">
                    <span className="name">{featured.author.name}</span>
                    <span className="by">
                      {featured.author.role} ·{" "}
                      {formatPostDate(featured.publishedAt)} ·{" "}
                      {featured.readTimeMinutes} min
                    </span>
                  </span>
                </div>
                <span className="arrow-circle" aria-hidden="true">
                  <ArrowDiag />
                </span>
              </div>
            </div>
          </Link>

          <aside className="recent-stories fade-up d2" aria-label="Recent stories">
            <div className="head">
              <h3>
                <span className="live-dot" aria-hidden="true" />
                Recent Stories
              </h3>
              <span className="view-all">View all</span>
            </div>
            <ul className="list">
              {recent.map((p, i) => (
                <li key={p.slug}>
                  <Link className="item" href={`/blog/${p.slug}`}>
                    <span className="idx">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="body">
                      <span className="title">{p.title}</span>
                      <span className="meta">
                        <b>{p.category}</b> · {formatPostDate(p.publishedAt)} ·{" "}
                        {p.readTimeMinutes} min
                      </span>
                    </span>
                    <span className="arrow" aria-hidden="true">
                      <svg
                        viewBox="0 0 14 14"
                        width={12}
                        height={12}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 7h8" />
                        <path d="m8 4 3 3-3 3" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      )}

      <Suspense fallback={<div className="grid-section" aria-hidden="true" />}>
        <BlogIndexShell posts={indexedPosts} />
      </Suspense>

      <section className="archive-section" aria-label="Archive">
        <div className="head">
          <h2>Archive.</h2>
          <span className="meta">{archive.length} essays · newest first</span>
        </div>
        <ul className="archive-list">
          {archive.map((p) => (
            <li key={p.slug}>
              <Link className="archive-row" href={`/blog/${p.slug}`}>
                <span className="date">{formatPostDateLong(p.publishedAt)}</span>
                <span className="title">{p.title}</span>
                <span className="cat">{p.category}</span>
                <span className="read">{p.readTimeMinutes} min</span>
                <span className="arrow" aria-hidden="true">
                  <svg
                    viewBox="0 0 14 14"
                    width={14}
                    height={14}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10 10 4" />
                    <path d="M5 4h5v5" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <NewsletterCta />
    </div>
  );
}
