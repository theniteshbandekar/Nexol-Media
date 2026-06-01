// LEGACY NAMING: this "sanity" directory is now fully FIRESTORE-backed via the
// Admin SDK (Sanity was the original CMS; there is no @sanity dependency). The
// directory name is kept to avoid churn across ~20 import paths.
import { cache } from "react";

import type { AccentHeading } from "@/lib/case-studies";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, SINGLETON_IDS } from "@/lib/firebase/collections";

export type HomeHero = {
  h1: AccentHeading;
  tagline?: string;
  scrollCue?: string;
};

export type HomeVsl = {
  title?: string;
  duration?: string;
  videoUrl?: string;
};

export type HomeStat = {
  target: number;
  suffix?: string;
  comma?: boolean;
  label: string;
};

export type HomeTestimonialCard =
  | {
      type: "text";
      span: 1 | 2 | 3 | 4;
      featured?: boolean;
      quote: string;
      name: string;
      role: string;
    }
  | {
      type: "video";
      span: 1 | 2 | 3 | 4;
      platform: "instagram" | "youtube";
      badgeLabel: string;
      name: string;
      role: string;
      href?: string;
    };

export type HomeSecondaryLink = { label: string; href: string };

export type HomeHook = {
  h2: AccentHeading;
  secondaryLinks: HomeSecondaryLink[];
};

export type HomePage = {
  hero: HomeHero;
  vsl: HomeVsl;
  stats: HomeStat[];
  testimonials: HomeTestimonialCard[];
  hook: HomeHook;
};

export const FALLBACK: HomePage = {
  hero: {
    h1: { before: "Polished Videos. ", accent: "Real Growth.", after: "" },
    tagline:
      "Editing, scripts & distribution for Tech, AI & Design creators.",
    scrollCue: "Scroll ↓",
  },
  vsl: {
    title: "How we grow Tech & AI creators",
    duration: "02:14",
  },
  stats: [
    { target: 250, suffix: "M", label: "Views generated" },
    { target: 8400, comma: true, label: "Videos shipped" },
    { target: 150, label: "Creators we partner with" },
  ],
  testimonials: [
    {
      type: "video",
      span: 1,
      platform: "instagram",
      badgeLabel: "Reel",
      name: "Adrien Ninet",
      role: "Design creator · 0:42",
      href: "/case-studies/adrien-ninet",
    },
    {
      type: "text",
      span: 2,
      featured: true,
      quote:
        "“We crossed a million subs in eight months. Nexol doesn’t just edit — they understand the platform.”",
      name: "Gordon Ly",
      role: "Tech & AI · 987K",
    },
    {
      type: "text",
      span: 3,
      quote: "“Clipping alone added 800K extra views. Best money I spend.”",
      name: "Leo De Matos",
      role: "AI Video · 100K+",
    },
    {
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
        label: "Read the Adrien Ninet case study",
        href: "/case-studies/adrien-ninet",
      },
      { label: "See all the work", href: "/case-studies" },
    ],
  },
};

export const getHomePage = cache(async (): Promise<HomePage> => {
  try {
    const doc = await getAdminDb()
      .collection(COLLECTIONS.singletons)
      .doc(SINGLETON_IDS.homePage)
      .get();
    const raw = (doc.data() as Partial<HomePage> | undefined) ?? null;
    if (!raw) return FALLBACK;
    return {
      hero: { ...FALLBACK.hero, ...(raw.hero ?? {}) },
      vsl: { ...FALLBACK.vsl, ...(raw.vsl ?? {}) },
      stats: raw.stats?.length ? raw.stats : FALLBACK.stats,
      testimonials: raw.testimonials?.length
        ? raw.testimonials
        : FALLBACK.testimonials,
      hook: {
        h2: raw.hook?.h2 ?? FALLBACK.hook.h2,
        secondaryLinks: raw.hook?.secondaryLinks?.length
          ? raw.hook.secondaryLinks
          : FALLBACK.hook.secondaryLinks,
      },
    };
  } catch (err) {
    console.warn("[homePage] Firestore fetch failed; using fallback.", err);
    return FALLBACK;
  }
});
