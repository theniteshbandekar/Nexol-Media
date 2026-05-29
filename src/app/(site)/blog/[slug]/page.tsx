import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatPostDate,
  formatPostDateLong,
  getAllBlogPosts,
  getPost,
  getRelatedPosts,
  isThinPost,
  type BlogBlock,
} from "@/lib/blog";
import { ReadingProgress } from "@/components/reading-progress";
import { JsonLd } from "@/components/json-ld";
import { RouteHidden } from "@/components/route-hidden";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

import "../blog.css";
import "./post.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const all = await getAllBlogPosts();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Essay not found", robots: { index: false } };

  const canonical = `/blog/${post.slug}`;
  const thin = isThinPost(post);

  return {
    title: post.title,
    description: post.dek,
    keywords: post.tags,
    alternates: { canonical },
    robots: thin
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "article",
      url: canonical,
      title: post.title,
      description: post.dek,
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt ?? post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.dek,
    },
  };
}

const toneClasses = ["tone-a", "tone-b", "tone-c", "tone-d", "tone-e", "tone-f"];

function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="post-body">
      {blocks.map((block, i) => {
        const key = `${block.kind}-${i}`;
        switch (block.kind) {
          case "p":
            return (
              <p key={key} className={block.dropCap ? "drop-cap" : undefined}>
                {block.text}
              </p>
            );
          case "h2":
            return (
              <h2 key={key}>
                <span className="num">({block.num})</span>
                {block.text}
              </h2>
            );
          case "ol":
            return (
              <ol key={key}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
          case "ul":
            return (
              <ul key={key}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={key} className="pullquote">
                {block.text}
                {block.by && <span className="by">{block.by}</span>}
              </blockquote>
            );
          case "figure":
            return (
              <figure key={key} className="figure">
                <div className="frame">
                  {block.src ? (
                    <Image
                      src={block.src}
                      alt={block.alt ?? ""}
                      fill
                      sizes="(max-width: 760px) 100vw, 760px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span className="ph-label" aria-hidden="true">
                      {block.placeholderLabel}
                    </span>
                  )}
                </div>
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 9.5a3 3 0 0 0 4.24 0l2.12-2.12a3 3 0 0 0-4.24-4.24l-1.06 1.06" />
      <path d="M9 6.5a3 3 0 0 0-4.24 0L2.64 8.62a3 3 0 0 0 4.24 4.24l1.06-1.06" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M11.6 2h2.16l-4.72 5.4L14.6 14H10.3l-3.4-4.46L3 14H.84l5.04-5.78L.6 2h4.4l3.06 4.04L11.6 2Zm-.76 10.7h1.2L4.32 3.22h-1.3l7.82 9.48Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 2.5h8v11l-4-2.5-4 2.5v-11Z" />
    </svg>
  );
}

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

function ArrowLeft() {
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
      <path d="M11 7H3" />
      <path d="m6 4-3 3 3 3" />
    </svg>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  if (settings.routeVisibility.blog === false) {
    return <RouteHidden label="Blog" />;
  }
  const post = await getPost(slug);
  if (!post) notFound();

  const [related, keepReading] = await Promise.all([
    getRelatedPosts(post, 4),
    getRelatedPosts(post, 3),
  ]);

  const schemas = isThinPost(post)
    ? []
    : [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]),
        articleSchema(post),
      ];

  return (
    <div className="post-page">
      {schemas.length > 0 && <JsonLd schema={schemas} />}
      <ReadingProgress />

      <Link className="back-link" href="/blog">
        <ArrowLeft />
        All essays
      </Link>

      <header className="post-header">
        <div className="pill-row">
          <span className="pill-tag">
            <span className="dot" />
            {post.category}
          </span>
          {post.featured && (
            <span className="pill-tag outline">
              <span className="dot" />
              Featured · {formatPostDateLong(post.publishedAt)}
            </span>
          )}
        </div>
        <h1>{post.title}</h1>
        <p className="dek">{post.dek}</p>
        <div className="post-byline">
          <div className="author">
            <span className="avatar">{post.author.initials}</span>
            <div>
              <div className="name">{post.author.name}</div>
              <div className="by">
                {post.author.role} · {formatPostDateLong(post.publishedAt)} ·{" "}
                {post.readTimeMinutes} min read
              </div>
            </div>
          </div>
          <div className="post-share" aria-label="Share">
            <button type="button" className="share-btn" aria-label="Copy link">
              <LinkIcon />
            </button>
            <button type="button" className="share-btn" aria-label="Share on X">
              <TwitterIcon />
            </button>
            <button type="button" className="share-btn" aria-label="Bookmark">
              <BookmarkIcon />
            </button>
          </div>
        </div>
      </header>

      <div className="post-hero" aria-hidden="true">
        {post.hero.kind === "image" ? (
          <Image
            src={post.hero.src}
            alt={post.hero.alt}
            fill
            sizes="(max-width: 1100px) 100vw, 1100px"
            priority
            style={{ objectFit: "cover" }}
          />
        ) : (
          <>
            <span className="pulse" />
            <span className="label">{post.hero.label}</span>
          </>
        )}
      </div>

      <div className="post-grid">
        <article>
          <BlogBody blocks={post.body} />

          <div className="post-end">
            <div className="tag-pills">
              {post.tags.map((t) => (
                <span key={t} className="pill-tag outline">
                  <span className="dot" />
                  {t}
                </span>
              ))}
            </div>
            <div className="post-share" aria-label="Share">
              <button type="button" className="share-btn" aria-label="Copy link">
                <LinkIcon />
              </button>
              <button
                type="button"
                className="share-btn"
                aria-label="Share on X"
              >
                <TwitterIcon />
              </button>
              <button type="button" className="share-btn" aria-label="Bookmark">
                <BookmarkIcon />
              </button>
            </div>
          </div>
        </article>

        <aside className="similar-stories" aria-label="Similar stories">
          <h3>
            <span className="swatch" aria-hidden="true" />
            Similar Stories
            <span className="count">
              {String(related.length).padStart(2, "0")}
            </span>
          </h3>
          {related.map((r) => (
            <Link key={r.slug} className="item" href={`/blog/${r.slug}`}>
              <div className="meta">
                {r.category} · {formatPostDate(r.publishedAt)} ·{" "}
                {r.readTimeMinutes} min
              </div>
              <div className="title">{r.title}</div>
            </Link>
          ))}
          <Link className="see-all" href="/blog">
            See all essays <ArrowDiag />
          </Link>
        </aside>
      </div>

      <section className="keep-reading" aria-label="Keep reading">
        <div className="head">
          <h2>Keep reading.</h2>
          <span className="meta">Three more from the bay</span>
        </div>
        <div className="grid">
          {keepReading.map((p, i) => (
            <Link key={p.slug} className="blog-card" href={`/blog/${p.slug}`}>
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
      </section>
    </div>
  );
}
