import { cache } from "react";

import type { AccentHeading } from "@/lib/case-studies";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, SINGLETON_IDS } from "@/lib/firebase/collections";

export type ProcessStep = {
  num: string;
  week: string;
  title: string;
  description: string;
};
export type TrustStat = { num: string; label: string };

export type ServicesIndex = {
  eyebrow: string;
  title: string;
  dek: string;
  processHeading: string;
  processMeta: string;
  processSteps: ProcessStep[];
  trustStats: TrustStat[];
  ctaHeading: string;
  ctaBody: string;
};

export type CaseStudiesIndex = { heading: AccentHeading };

export const SERVICES_INDEX_FALLBACK: ServicesIndex = {
  eyebrow: "(02) What we do",
  title: "Five services. One job",
  dek: "Growth does not happen by accident. We run a tight set of services for Tech, AI and Design creators — each one chosen because it moves a single number you care about.",
  processHeading: "How an engagement runs.",
  processMeta: "Default · 60-day window",
  processSteps: [
    {
      num: "(01)",
      week: "Week 01",
      title: "Learn the channel.",
      description:
        "We watch the last 30 uploads, read every comment thread, and pull the three patterns we can move first.",
    },
    {
      num: "(02)",
      week: "Week 02",
      title: "Ship the first batch.",
      description:
        "Three videos delivered with our cut framework applied — same scripts, rebuilt hooks, new thumbnails.",
    },
    {
      num: "(03)",
      week: "Weeks 03 – 08",
      title: "Iterate Fridays.",
      description:
        "Every Friday we review what is working and what is not. We double down, we cut what is not.",
    },
    {
      num: "(04)",
      week: "Day 60",
      title: "Renew or part.",
      description:
        "We share a clean report against the numbers we set on day one. Then we renew, evolve the scope, or part ways cleanly.",
    },
  ],
  trustStats: [
    { num: "150+", label: "Creators served" },
    { num: "60", label: "Day default window" },
    { num: "300k+", label: "Followers added" },
  ],
  ctaHeading: "Serious creators choose Nexol Media.",
  ctaBody:
    "Send a brief or book a 30-minute call. A real person on our team replies within one working day.",
};

export const CASE_STUDIES_INDEX_FALLBACK: CaseStudiesIndex = {
  heading: {
    before: "Here are some Nexol ",
    accent: "stories",
    after: " for you.",
  },
};

export const getServicesIndex = cache(async (): Promise<ServicesIndex> => {
  try {
    const doc = await getAdminDb()
      .collection(COLLECTIONS.singletons)
      .doc(SINGLETON_IDS.servicesIndex)
      .get();
    const raw = doc.data() as Partial<ServicesIndex> | undefined;
    if (!raw) return SERVICES_INDEX_FALLBACK;
    return {
      eyebrow: raw.eyebrow ?? SERVICES_INDEX_FALLBACK.eyebrow,
      title: raw.title ?? SERVICES_INDEX_FALLBACK.title,
      dek: raw.dek ?? SERVICES_INDEX_FALLBACK.dek,
      processHeading: raw.processHeading ?? SERVICES_INDEX_FALLBACK.processHeading,
      processMeta: raw.processMeta ?? SERVICES_INDEX_FALLBACK.processMeta,
      processSteps: raw.processSteps?.length
        ? raw.processSteps
        : SERVICES_INDEX_FALLBACK.processSteps,
      trustStats: raw.trustStats?.length
        ? raw.trustStats
        : SERVICES_INDEX_FALLBACK.trustStats,
      ctaHeading: raw.ctaHeading ?? SERVICES_INDEX_FALLBACK.ctaHeading,
      ctaBody: raw.ctaBody ?? SERVICES_INDEX_FALLBACK.ctaBody,
    };
  } catch (err) {
    console.warn("[servicesIndex] fetch failed; using fallback.", err);
    return SERVICES_INDEX_FALLBACK;
  }
});

export const getCaseStudiesIndex = cache(async (): Promise<CaseStudiesIndex> => {
  try {
    const doc = await getAdminDb()
      .collection(COLLECTIONS.singletons)
      .doc(SINGLETON_IDS.caseStudiesIndex)
      .get();
    const raw = doc.data() as Partial<CaseStudiesIndex> | undefined;
    if (!raw?.heading) return CASE_STUDIES_INDEX_FALLBACK;
    return { heading: raw.heading };
  } catch (err) {
    console.warn("[caseStudiesIndex] fetch failed; using fallback.", err);
    return CASE_STUDIES_INDEX_FALLBACK;
  }
});
