/**
 * Seed Firestore from the legacy TypeScript content (the same source the
 * Sanity migration used). Idempotent — uses doc(id).set(), so re-running
 * overwrites docs to match the legacy seed every time.
 *
 * Documents are written in the EXACT shape of the existing view types
 * (BlogPost, CaseStudy, Service, HomePage, SiteSettings, LegalPage) so the
 * P3 fetcher rewrite is a true identity mapping. The only transforms are:
 *   - rewrite the one real image's src to a Firebase Storage download URL
 *   - add a denormalized `authorId` to blog posts (+ a blogAuthors collection)
 *   - add `published: true` to blogPosts/caseStudies/services
 *
 * Run with:
 *   npx tsx --env-file=.env.local scripts/seed-firestore.ts
 *
 * Required env (in .env.local): FIREBASE_SERVICE_ACCOUNT_KEY,
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.
 *
 * NOTE: inits firebase-admin inline — it must NOT import src/lib/firebase/admin
 * or storage, which use `import "server-only"` and throw under plain tsx.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { __LEGACY_BLOG_POSTS, type BlogPost } from "../src/lib/blog";
import { __LEGACY_CASE_STUDIES, type CaseStudy } from "../src/lib/case-studies";
import { __LEGACY_SERVICES, type Service } from "../src/lib/services";
import { FALLBACK as HOME_FALLBACK } from "../src/lib/sanity/home-page";
import { FALLBACK as SETTINGS_FALLBACK } from "../src/lib/sanity/site-settings";
import type { LegalBlock, LegalPage } from "../src/lib/sanity/legal-pages";
import { COLLECTIONS, SINGLETON_IDS } from "../src/lib/firebase/collections";

// ────────────────────────────────────────────────────────────────────────────
// Firebase Admin (inline init)
// ────────────────────────────────────────────────────────────────────────────

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!serviceAccountKey) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY. Run with --env-file=.env.local.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(serviceAccountKey)), storageBucket });
}

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
const bucket = getStorage().bucket();

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function kebab(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

// Upload a /public image to Storage and return a tokenized download URL.
// Idempotent: reuses the existing download token if the object already exists,
// so the stored URL is stable across re-runs. Memoized per source path.
const urlCache = new Map<string, string>();

async function uploadPublicImage(publicSrc: string): Promise<string> {
  const cached = urlCache.get(publicSrc);
  if (cached) return cached;

  const clean = publicSrc.replace(/^\//, "");
  const destPath = `images/${clean}`;
  const ext = clean.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const file = bucket.file(destPath);

  let token: string | undefined;
  const [exists] = await file.exists();
  if (exists) {
    const [meta] = await file.getMetadata();
    token = (meta.metadata?.firebaseStorageDownloadTokens as string | undefined)?.split(",")[0];
  }
  if (!exists || !token) {
    token = randomUUID();
    const buf = readFileSync(resolve(process.cwd(), "public", clean));
    await file.save(buf, {
      contentType,
      resumable: false,
      metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    });
  }

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destPath)}?alt=media&token=${token}`;
  urlCache.set(publicSrc, url);
  return url;
}

async function resolveImage(img: { src: string; alt: string }) {
  return img.src.startsWith("/")
    ? { src: await uploadPublicImage(img.src), alt: img.alt }
    : img;
}

// ────────────────────────────────────────────────────────────────────────────
// Seeders
// ────────────────────────────────────────────────────────────────────────────

async function seedAuthors(posts: BlogPost[]): Promise<Map<string, string>> {
  const byName = new Map<string, BlogPost["author"]>();
  for (const p of posts) byName.set(p.author.name, p.author);

  const idByName = new Map<string, string>();
  for (const [name, author] of byName) {
    const id = `author-${kebab(name)}`;
    await db.collection(COLLECTIONS.blogAuthors).doc(id).set({
      name: author.name,
      role: author.role,
      initials: author.initials,
    });
    idByName.set(name, id);
    console.log(`  ✓ author ${name} → ${id}`);
  }
  return idByName;
}

async function seedBlogPosts(posts: BlogPost[], authorIdByName: Map<string, string>) {
  for (const p of posts) {
    await db.collection(COLLECTIONS.blogPosts).doc(p.slug).set({
      ...p,
      authorId: authorIdByName.get(p.author.name),
      featured: p.featured ?? false,
      published: true,
    });
    console.log(`  ✓ post ${p.slug}`);
  }
}

async function seedCaseStudies(studies: CaseStudy[]) {
  for (const s of studies) {
    const cardImage = s.cardImage ? await resolveImage(s.cardImage) : undefined;
    const rows = s.rows
      ? await Promise.all(
          s.rows.map(async (row) =>
            row.photo.kind === "image"
              ? { ...row, photo: { ...row.photo, ...(await resolveImage(row.photo)) } }
              : row,
          ),
        )
      : undefined;

    await db.collection(COLLECTIONS.caseStudies).doc(s.slug).set({
      ...s,
      cardImage,
      rows,
      comingSoon: s.comingSoon ?? false,
      published: true,
    });
    console.log(`  ✓ case study ${s.slug}`);
  }
}

async function seedServices(services: Service[]) {
  for (const s of services) {
    await db.collection(COLLECTIONS.services).doc(s.slug).set({
      ...s,
      published: true,
    });
    console.log(`  ✓ service ${s.slug}`);
  }
}

async function seedSingletons() {
  const col = db.collection(COLLECTIONS.singletons);

  await col.doc(SINGLETON_IDS.homePage).set({ ...HOME_FALLBACK });
  console.log("  ✓ singleton homePage");

  await col.doc(SINGLETON_IDS.siteSettings).set({
    ...SETTINGS_FALLBACK,
    routeVisibility: {
      blog: false,
      caseStudies: false,
      services: true,
      about: true,
      contact: true,
    },
  });
  console.log("  ✓ singleton siteSettings (blog + caseStudies hidden)");

  await col.doc(SINGLETON_IDS.servicesIndex).set(SERVICES_INDEX);
  console.log("  ✓ singleton servicesIndex");

  await col.doc(SINGLETON_IDS.caseStudiesIndex).set(CASE_STUDIES_INDEX);
  console.log("  ✓ singleton caseStudiesIndex");
}

async function seedLegalPages() {
  for (const page of [PRIVACY, TERMS]) {
    await db.collection(COLLECTIONS.legalPages).doc(page.kind).set(page);
    console.log(`  ✓ legal ${page.kind}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Singleton + legal literals
// (servicesIndex/caseStudiesIndex shapes mirror the hardcoded page copy and are
//  finalized when P3 wires the pages to read them.)
// ────────────────────────────────────────────────────────────────────────────

const SERVICES_INDEX = {
  process: {
    heading: "How an engagement runs.",
    meta: "Default · 60-day window",
    steps: [
      { num: "01", week: "Week 01", title: "Learn the channel.", description: "We watch the last 30 uploads, read every comment thread, and pull the three patterns we can move first." },
      { num: "02", week: "Week 02", title: "Ship the first batch.", description: "Three videos delivered with our cut framework applied — same scripts, rebuilt hooks, new thumbnails." },
      { num: "03", week: "Weeks 03 – 08", title: "Iterate Fridays.", description: "Every Friday we review what is working and what is not. We double down, we cut what is not." },
      { num: "04", week: "Day 60", title: "Renew or part.", description: "We share a clean report against the numbers we set on day one. Then we renew, evolve the scope, or part ways cleanly." },
    ],
  },
  trustStats: [
    { num: "150+", label: "Creators served" },
    { num: "60", label: "Day default window" },
    { num: "300k+", label: "Followers added" },
  ],
  cta: {
    heading: "Serious creators choose Nexol Media.",
    description: "Send a brief or book a 30-minute call. A real person on our team replies within one working day.",
    primary: { label: "Send a brief", href: "/contact" },
    secondary: { label: "Book a call", href: "/contact#book" },
  },
};

const CASE_STUDIES_INDEX = {
  heading: { before: "Here are some Nexol ", accent: "stories", after: " for you." },
};

const LEGAL_LAST_UPDATED = "2026-05-29T00:00:00.000Z";

function paragraph(key: string, text: string): LegalBlock {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${key}-s`, _type: "span", text, marks: [] }],
  };
}

function heading(key: string, style: "h2" | "h3", text: string): LegalBlock {
  return {
    _key: key,
    _type: "block",
    style,
    markDefs: [],
    children: [{ _key: `${key}-s`, _type: "span", text, marks: [] }],
  };
}

const PRIVACY: LegalPage = {
  kind: "privacy",
  title: "Privacy policy",
  intro:
    "We respect your privacy. This page explains what information we collect, how we use it, and the choices you have.",
  lastUpdated: LEGAL_LAST_UPDATED,
  body: [
    paragraph("p-1", "Nexol Media collects only the data we need to reply to your brief, run essential analytics, and keep the site working. We never sell your data."),
    heading("h-1", "h2", "What we collect"),
    paragraph("p-2", "If you fill out the contact brief, we store the fields you submit (name, email, channel, message). If you subscribe to the newsletter, we store your email and the timestamp of the signup."),
    paragraph("p-3", "If you accept analytics cookies, we collect aggregated session data via Google Analytics and Microsoft Clarity. You can decline this at any time using the cookie banner."),
    heading("h-2", "h2", "How long we keep it"),
    paragraph("p-4", "Briefs are kept for up to 24 months. Newsletter subscriptions are kept until you unsubscribe (one-click link in every email). Analytics data is retained per the provider's default — 14 months for GA4."),
    heading("h-3", "h2", "Your rights"),
    paragraph("p-5", "You can request access, correction, or deletion of any personal data we hold about you by emailing info@nexolmedia.com. We respond within one working day."),
  ],
};

const TERMS: LegalPage = {
  kind: "terms",
  title: "Terms of service",
  intro:
    "By using nexolmedia.com you agree to the following terms. They are written in plain language because legalese makes nobody safer.",
  lastUpdated: LEGAL_LAST_UPDATED,
  body: [
    heading("th-1", "h2", "Use of the site"),
    paragraph("tp-1", "The site is for general information about Nexol Media's services. We try to keep it accurate but make no warranty that it is error-free."),
    heading("th-2", "h2", "Engagements"),
    paragraph("tp-2", "Any paid engagement is governed by a separate signed agreement. Nothing on this site is a binding offer or fee schedule."),
    heading("th-3", "h2", "Intellectual property"),
    paragraph("tp-3", "All content on this site (copy, images, logos) is owned by Nexol Media unless credited otherwise. Please don't repost without permission."),
    heading("th-4", "h2", "Jurisdiction"),
    paragraph("tp-4", "These terms are governed by the laws of India. Disputes will be heard in the courts of Mumbai unless we agree otherwise in writing."),
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Read-back verification
// ────────────────────────────────────────────────────────────────────────────

async function verify() {
  console.log("\nRead-back:");
  const counts: Array<[string, string]> = [
    ["blogAuthors", COLLECTIONS.blogAuthors],
    ["blogPosts", COLLECTIONS.blogPosts],
    ["caseStudies", COLLECTIONS.caseStudies],
    ["services", COLLECTIONS.services],
    ["singletons", COLLECTIONS.singletons],
    ["legalPages", COLLECTIONS.legalPages],
  ];
  for (const [label, coll] of counts) {
    const snap = await db.collection(coll).get();
    console.log(`  ${label}: ${snap.size}`);
  }

  const cs = await db.collection(COLLECTIONS.caseStudies).doc("adrien-ninet").get();
  const src = cs.data()?.cardImage?.src as string | undefined;
  if (!src || !src.startsWith("https://firebasestorage.googleapis.com/")) {
    throw new Error(`adrien-ninet cardImage.src is not a Storage URL: ${src}`);
  }
  const res = await fetch(src, { method: "GET" });
  console.log(`  adrien-ninet cardImage → HTTP ${res.status} (${src.slice(0, 80)}…)`);
  if (!res.ok) throw new Error(`Image URL not publicly reachable (HTTP ${res.status})`);
}

// ────────────────────────────────────────────────────────────────────────────
// Run
// ────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`Seeding Firestore (project from service account) …\n`);

  console.log("Authors:");
  const authorIds = await seedAuthors(__LEGACY_BLOG_POSTS);

  console.log("\nBlog posts:");
  await seedBlogPosts(__LEGACY_BLOG_POSTS, authorIds);

  console.log("\nCase studies:");
  await seedCaseStudies(__LEGACY_CASE_STUDIES);

  console.log("\nServices:");
  await seedServices(__LEGACY_SERVICES);

  console.log("\nSingletons:");
  await seedSingletons();

  console.log("\nLegal pages:");
  await seedLegalPages();

  await verify();

  console.log("\n✅ Seed complete.");
}

run().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
