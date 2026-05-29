import { cache } from "react";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export type LegalPageKind = "privacy" | "terms";

/** Sanity Portable Text block — minimal shape we render. */
export type LegalBlock = {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: Array<{
    _key?: string;
    _type?: string;
    text?: string;
    marks?: string[];
  }>;
  markDefs?: Array<{ _key: string; _type: string; href?: string }>;
};

export type LegalPage = {
  kind: LegalPageKind;
  title: string;
  intro?: string;
  body: LegalBlock[];
  lastUpdated?: string;
};

const FALLBACK: Record<LegalPageKind, LegalPage> = {
  privacy: {
    kind: "privacy",
    title: "Privacy policy",
    intro:
      "We respect your privacy. This page is a placeholder until the full policy is published in the Studio.",
    body: [],
    lastUpdated: undefined,
  },
  terms: {
    kind: "terms",
    title: "Terms of service",
    intro:
      "These are the standard terms for visitors to nexolmedia.com. This page is a placeholder until the full terms are published in the Studio.",
    body: [],
    lastUpdated: undefined,
  },
};

export const getLegalPage = cache(async (
  kind: LegalPageKind
): Promise<LegalPage> => {
  try {
    const doc = await getAdminDb()
      .collection(COLLECTIONS.legalPages)
      .doc(kind)
      .get();
    const raw = doc.data() as LegalPage | undefined;
    if (!raw) return FALLBACK[kind];
    return {
      kind: raw.kind,
      title: raw.title ?? FALLBACK[kind].title,
      intro: raw.intro,
      body: raw.body ?? [],
      lastUpdated: raw.lastUpdated,
    };
  } catch (err) {
    console.warn(`[legal] ${kind} fetch failed; using fallback.`, err);
    return FALLBACK[kind];
  }
});
