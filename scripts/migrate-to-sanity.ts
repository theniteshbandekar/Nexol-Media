/**
 * One-time migration script.
 *
 * Reads the LEGACY_* arrays from the lib files and seeds the Sanity dataset
 * with matching documents. Re-running this script is safe (idempotent) — it
 * uses `createOrReplace`, so the docs match the legacy seed every time.
 *
 * Run with:
 *   npx tsx scripts/migrate-to-sanity.ts
 *
 * Required env vars (in .env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_WRITE_TOKEN   (create one in sanity.io/manage with Editor role)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { __LEGACY_BLOG_POSTS, type BlogPost, type BlogBlock } from "../src/lib/blog";
import {
  __LEGACY_CASE_STUDIES,
  type CaseStudy,
  type CaseStudyRow,
  type StoryPhoto,
} from "../src/lib/case-studies";
import { __LEGACY_SERVICES, type Service } from "../src/lib/services";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function deterministicKey(prefix: string, i: number): string {
  return `${prefix}-${i.toString(36)}`;
}

async function uploadLocalImage(
  publicPath: string,
  filename: string
): Promise<{ _type: "image"; asset: { _ref: string } } | null> {
  const filePath = resolve(process.cwd(), "public", publicPath.replace(/^\//, ""));
  try {
    const buf = readFileSync(filePath);
    const asset = await client.assets.upload("image", buf, { filename });
    return { _type: "image", asset: { _ref: asset._id } };
  } catch (err) {
    console.warn(`  ! Couldn't upload ${publicPath}:`, (err as Error).message);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Authors
// ────────────────────────────────────────────────────────────────────────────

async function seedAuthors(posts: BlogPost[]) {
  const byName = new Map<string, BlogPost["author"]>();
  for (const p of posts) byName.set(p.author.name, p.author);

  const idByName = new Map<string, string>();
  for (const [name, author] of byName) {
    const id = `author-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await client.createOrReplace({
      _id: id,
      _type: "blogAuthor",
      name: author.name,
      role: author.role,
      initials: author.initials,
    });
    idByName.set(name, id);
    console.log(`  ✓ Author: ${name}`);
  }
  return idByName;
}

// ────────────────────────────────────────────────────────────────────────────
// Blog posts
// ────────────────────────────────────────────────────────────────────────────

function bodyToPortableText(body: BlogBlock[]): unknown[] {
  return body.map((block, i) => {
    const _key = deterministicKey("blk", i);
    switch (block.kind) {
      case "p":
        return {
          _type: "block",
          _key,
          style: "normal",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: `${_key}-s`,
              text: block.text,
              marks: block.dropCap ? ["dropCap"] : [],
            },
          ],
        };
      case "h2":
        return {
          _type: "block",
          _key,
          style: "h2",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: `${_key}-s`,
              text: `(${block.num}) ${block.text}`,
              marks: [],
            },
          ],
        };
      case "ol":
        return block.items.map((item, j) => ({
          _type: "block",
          _key: `${_key}-${j}`,
          listItem: "number",
          level: 1,
          style: "normal",
          markDefs: [],
          children: [
            { _type: "span", _key: `${_key}-${j}-s`, text: item, marks: [] },
          ],
        }));
      case "ul":
        return block.items.map((item, j) => ({
          _type: "block",
          _key: `${_key}-${j}`,
          listItem: "bullet",
          level: 1,
          style: "normal",
          markDefs: [],
          children: [
            { _type: "span", _key: `${_key}-${j}-s`, text: item, marks: [] },
          ],
        }));
      case "quote":
        return {
          _type: "pullquote",
          _key,
          text: block.text,
          by: block.by,
        };
      case "figure":
        return {
          _type: "figure",
          _key,
          placeholderLabel: block.placeholderLabel,
          caption: block.caption,
        };
    }
  }).flat();
}

async function seedBlogPosts(
  authorIdByName: Map<string, string>,
  posts: BlogPost[]
) {
  for (const p of posts) {
    const authorId = authorIdByName.get(p.author.name);
    if (!authorId) continue;
    const id = `post-${p.slug}`;
    await client.createOrReplace({
      _id: id,
      _type: "blogPost",
      slug: { _type: "slug", current: p.slug },
      title: p.title,
      dek: p.dek,
      category: p.category,
      publishedAt: `${p.publishedAt}T00:00:00.000Z`,
      modifiedAt: p.modifiedAt
        ? `${p.modifiedAt}T00:00:00.000Z`
        : undefined,
      readTimeMinutes: p.readTimeMinutes,
      tags: p.tags,
      featured: p.featured ?? false,
      published: true,
      author: { _type: "reference", _ref: authorId },
      heroLabel: p.hero.kind === "placeholder" ? p.hero.label : undefined,
      body: bodyToPortableText(p.body),
    } as any);
    console.log(`  ✓ Post: ${p.title}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Case studies
// ────────────────────────────────────────────────────────────────────────────

async function seedCaseStudies(studies: CaseStudy[]) {
  const slugToId = new Map<string, string>();
  // Two passes — first create all so cross-references resolve.
  for (const s of studies) {
    const id = `case-${s.slug}`;
    slugToId.set(s.slug, id);

    let cardImage: any = undefined;
    if (s.cardImage?.src.startsWith("/")) {
      const uploaded = await uploadLocalImage(
        s.cardImage.src,
        `${s.slug}-card.png`
      );
      if (uploaded) cardImage = { ...uploaded, alt: s.cardImage.alt };
    }

    const rows = await Promise.all(
      (s.rows ?? []).map(async (row, i) => transformRowToSanity(row, s.slug, i))
    );

    await client.createOrReplace({
      _id: id,
      _type: "caseStudy",
      slug: { _type: "slug", current: s.slug },
      name: s.name,
      role: s.role,
      description: s.description,
      comingSoon: s.comingSoon ?? false,
      published: true,
      publishedAt: s.publishedAt
        ? `${s.publishedAt}T00:00:00.000Z`
        : undefined,
      cardImage,
      title: s.title,
      stats: (s.stats ?? []).map((st, i) => ({
        _key: deterministicKey("stat", i),
        ...st,
      })),
      rows,
      ctaHook: s.ctaHook,
    } as any);
    console.log(`  ✓ Case study: ${s.name}`);
  }
  return slugToId;
}

async function transformRowToSanity(
  row: CaseStudyRow,
  studySlug: string,
  i: number
) {
  const _key = deterministicKey("row", i);
  const photo = await transformPhotoToSanity(row.photo, studySlug, i);
  return {
    _key,
    _type: "storyRow",
    num: row.num,
    heading: row.heading,
    body: row.body,
    photo,
    layout: row.layout,
  };
}

async function transformPhotoToSanity(
  photo: StoryPhoto,
  studySlug: string,
  i: number
) {
  if (photo.kind === "image" && photo.src.startsWith("/")) {
    const uploaded = await uploadLocalImage(
      photo.src,
      `${studySlug}-row-${i}.png`
    );
    if (uploaded) {
      return {
        _type: "storyPhoto",
        kind: "image",
        image: { ...uploaded, alt: photo.alt },
      };
    }
  }
  return {
    _type: "storyPhoto",
    kind: "placeholder",
    label: photo.kind === "placeholder" ? photo.label : "Photo",
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Services
// ────────────────────────────────────────────────────────────────────────────

async function seedServices(
  services: Service[],
  caseStudyIdBySlug: Map<string, string>
) {
  for (const s of services) {
    const id = `svc-${s.slug}`;
    const workSamples = s.workSamples.map((w, i) => ({
      _key: deterministicKey("ws", i),
      _type: "workSample",
      label: w.label,
      caseStudy: w.caseStudySlug
        ? {
            _type: "reference",
            _ref: caseStudyIdBySlug.get(w.caseStudySlug),
          }
        : undefined,
    }));
    await client.createOrReplace({
      _id: id,
      _type: "service",
      slug: { _type: "slug", current: s.slug },
      num: s.num,
      title: s.title,
      tagline: s.tagline,
      pills: s.pills,
      description: s.description,
      deliverablesMeta: s.deliverablesMeta,
      deliverables: s.deliverables.map((d, i) => ({
        _key: deterministicKey("d", i),
        _type: "deliverable",
        ...d,
      })),
      workHeading: s.workHeading,
      workMeta: s.workMeta,
      workSamples,
      metricsMeta: s.metricsMeta,
      metrics: s.metrics.map((m, i) => ({
        _key: deterministicKey("m", i),
        _type: "serviceMetric",
        ...m,
      })),
      processMeta: s.processMeta,
      process: s.process.map((p, i) => ({
        _key: deterministicKey("p", i),
        _type: "processStep",
        ...p,
      })),
      ctaHeading: s.ctaHeading,
      faqs: (s.faqs ?? []).map((f, i) => ({
        _key: deterministicKey("f", i),
        _type: "serviceFaq",
        ...f,
      })),
      published: true,
    } as any);
    console.log(`  ✓ Service: ${s.title}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Singletons
// ────────────────────────────────────────────────────────────────────────────

async function seedHomePage() {
  await client.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    hero: {
      h1: {
        before: "Polished Videos. ",
        accent: "Real Growth.",
        after: "",
      },
      tagline: "Editing, scripts & distribution for Tech, AI & Design creators.",
      scrollCue: "Scroll ↓",
    },
    vsl: {
      title: "How we grow Tech & AI creators",
      duration: "02:14",
    },
    stats: [
      {
        _key: deterministicKey("st", 0),
        _type: "statBlock",
        target: 250,
        suffix: "M",
        label: "Views generated",
      },
      {
        _key: deterministicKey("st", 1),
        _type: "statBlock",
        target: 8400,
        comma: true,
        label: "Videos shipped",
      },
      {
        _key: deterministicKey("st", 2),
        _type: "statBlock",
        target: 150,
        label: "Creators we partner with",
      },
    ],
    testimonials: [
      {
        _key: "t-0",
        _type: "testimonialCard",
        type: "video",
        span: 1,
        platform: "instagram",
        badgeLabel: "Reel",
        name: "Adrien Ninet",
        role: "Design creator · 0:42",
        href: "/case-studies/adrien-ninet",
      },
      {
        _key: "t-1",
        _type: "testimonialCard",
        type: "text",
        span: 2,
        featured: true,
        quote:
          "“We crossed a million subs in eight months. Nexol doesn’t just edit — they understand the platform.”",
        name: "Gordon Ly",
        role: "Tech & AI · 987K",
      },
      {
        _key: "t-2",
        _type: "testimonialCard",
        type: "text",
        span: 3,
        quote: "“Clipping alone added 800K extra views. Best money I spend.”",
        name: "Leo De Matos",
        role: "AI Video · 100K+",
      },
      {
        _key: "t-3",
        _type: "testimonialCard",
        type: "video",
        span: 4,
        platform: "youtube",
        badgeLabel: "Video",
        name: "Mr. Pynk",
        role: "Podcast host · 1:08",
      },
    ],
    hook: {
      h2: {
        before: "You have what it takes. ",
        accent: "We deliver it to the world.",
      },
      secondaryLinks: [
        {
          _key: "sl-0",
          _type: "secondaryLink",
          label: "Read the Adrien Ninet case study",
          href: "/case-studies/adrien-ninet",
        },
        {
          _key: "sl-1",
          _type: "secondaryLink",
          label: "See all the work",
          href: "/case-studies",
        },
      ],
    },
  } as any);
  console.log("  ✓ Home page singleton");
}

async function seedLegalPages() {
  const today = new Date().toISOString();
  await client.createOrReplace({
    _id: "legal-privacy",
    _type: "legalPage",
    kind: "privacy",
    title: "Privacy policy",
    intro:
      "We respect your privacy. This page explains what information we collect, how we use it, and the choices you have.",
    lastUpdated: today,
    body: [
      paragraph(
        "p-1",
        "Nexol Media collects only the data we need to reply to your brief, run essential analytics, and keep the site working. We never sell your data."
      ),
      heading("h-1", "h2", "What we collect"),
      paragraph(
        "p-2",
        "If you fill out the contact brief, we store the fields you submit (name, email, channel, message). If you subscribe to the newsletter, we store your email and the timestamp of the signup."
      ),
      paragraph(
        "p-3",
        "If you accept analytics cookies, we collect aggregated session data via Google Analytics and Microsoft Clarity. You can decline this at any time using the cookie banner."
      ),
      heading("h-2", "h2", "How long we keep it"),
      paragraph(
        "p-4",
        "Briefs are kept for up to 24 months. Newsletter subscriptions are kept until you unsubscribe (one-click link in every email). Analytics data is retained per the provider's default — 14 months for GA4."
      ),
      heading("h-3", "h2", "Your rights"),
      paragraph(
        "p-5",
        "You can request access, correction, or deletion of any personal data we hold about you by emailing info@nexolmedia.com. We respond within one working day."
      ),
    ],
  } as any);
  console.log("  ✓ Legal · privacy");

  await client.createOrReplace({
    _id: "legal-terms",
    _type: "legalPage",
    kind: "terms",
    title: "Terms of service",
    intro:
      "By using nexolmedia.com you agree to the following terms. They are written in plain language because legalese makes nobody safer.",
    lastUpdated: today,
    body: [
      heading("th-1", "h2", "Use of the site"),
      paragraph(
        "tp-1",
        "The site is for general information about Nexol Media's services. We try to keep it accurate but make no warranty that it is error-free."
      ),
      heading("th-2", "h2", "Engagements"),
      paragraph(
        "tp-2",
        "Any paid engagement is governed by a separate signed agreement. Nothing on this site is a binding offer or fee schedule."
      ),
      heading("th-3", "h2", "Intellectual property"),
      paragraph(
        "tp-3",
        "All content on this site (copy, images, logos) is owned by Nexol Media unless credited otherwise. Please don't repost without permission."
      ),
      heading("th-4", "h2", "Jurisdiction"),
      paragraph(
        "tp-4",
        "These terms are governed by the laws of India. Disputes will be heard in the courts of Mumbai unless we agree otherwise in writing."
      ),
    ],
  } as any);
  console.log("  ✓ Legal · terms");
}

function paragraph(key: string, text: string) {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${key}-s`, _type: "span", text, marks: [] }],
  };
}

function heading(key: string, style: "h2" | "h3", text: string) {
  return {
    _key: key,
    _type: "block",
    style,
    markDefs: [],
    children: [{ _key: `${key}-s`, _type: "span", text, marks: [] }],
  };
}

async function seedSiteSettings() {
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    primaryNav: [
      { _key: "n-0", _type: "navItem", label: "Services", href: "/services" },
      {
        _key: "n-1",
        _type: "navItem",
        label: "Case Studies",
        href: "/case-studies",
      },
      { _key: "n-2", _type: "navItem", label: "Blog", href: "/blog" },
      { _key: "n-3", _type: "navItem", label: "Contact", href: "/contact" },
    ],
    headerCtaLabel: "Book a Call",
    headerCtaHref: "/book",
    footerTagline:
      "Polished videos and real growth for Tech, AI, and Design creators.",
    footerServices: [
      {
        _key: "fs-0",
        _type: "footerLink",
        label: "Personal Brand",
        href: "/services/personal-brand",
      },
      {
        _key: "fs-1",
        _type: "footerLink",
        label: "Post Production",
        href: "/services/post-production",
      },
      {
        _key: "fs-2",
        _type: "footerLink",
        label: "Podcast Distribution",
        href: "/services/podcast-distribution",
      },
      {
        _key: "fs-3",
        _type: "footerLink",
        label: "Launch Videos",
        href: "/services/launch-videos",
      },
      {
        _key: "fs-4",
        _type: "footerLink",
        label: "Clipping",
        href: "/services/clipping",
      },
    ],
    footerCompany: [
      {
        _key: "fc-0",
        _type: "footerLink",
        label: "Case Studies",
        href: "/case-studies",
      },
      { _key: "fc-1", _type: "footerLink", label: "Blog", href: "/blog" },
      { _key: "fc-2", _type: "footerLink", label: "About", href: "/about" },
      { _key: "fc-3", _type: "footerLink", label: "Contact", href: "/contact" },
      { _key: "fc-4", _type: "footerLink", label: "Privacy", href: "/privacy" },
      { _key: "fc-5", _type: "footerLink", label: "Terms", href: "/terms" },
    ],
    footerConnect: [
      {
        _key: "fk-0",
        _type: "footerLink",
        label: "Instagram ↗",
        href: "https://www.instagram.com/nexolmedia",
        external: true,
      },
      {
        _key: "fk-1",
        _type: "footerLink",
        label: "X / Twitter ↗",
        href: "https://x.com/nexolmedia",
        external: true,
      },
      {
        _key: "fk-2",
        _type: "footerLink",
        label: "info@nexolmedia.com",
        href: "mailto:info@nexolmedia.com",
      },
      {
        _key: "fk-3",
        _type: "footerLink",
        label: "Book a Call",
        href: "/book",
      },
    ],
    footerLocation: "Mumbai · Worldwide",
    footerRights: "All rights reserved",
    routeVisibility: {
      blog: true,
      caseStudies: true,
      services: true,
      about: true,
      contact: true,
    },
  } as any);
  console.log("  ✓ Site settings singleton");
}

// ────────────────────────────────────────────────────────────────────────────
// Run
// ────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log("Seeding Sanity dataset …\n");

  console.log("Authors:");
  const authorIds = await seedAuthors(__LEGACY_BLOG_POSTS);
  console.log("");

  console.log("Blog posts:");
  await seedBlogPosts(authorIds, __LEGACY_BLOG_POSTS);
  console.log("");

  console.log("Case studies:");
  const caseStudyIds = await seedCaseStudies(__LEGACY_CASE_STUDIES);
  console.log("");

  console.log("Services:");
  await seedServices(__LEGACY_SERVICES, caseStudyIds);
  console.log("");

  console.log("Singletons:");
  await seedHomePage();
  await seedSiteSettings();
  console.log("");

  console.log("Legal pages:");
  await seedLegalPages();
  console.log("");

  console.log("✅ Migration complete.");
}

run().catch((err) => {
  console.error("\n❌ Migration failed:", err);
  process.exit(1);
});
