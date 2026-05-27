import { getSanityClient } from "./sanity/client";
import {
  allCaseStudiesQuery,
  caseStudyBySlugQuery,
} from "./sanity/queries";
import { transformCaseStudy } from "./sanity/transform";

/** Headline fragment with an optional lime-underlined accent word/phrase. */
export type AccentHeading = {
  before: string;
  accent?: string;
  after?: string;
};

/** Story row paragraph — plain text with an optional trailing bold sentence. */
export type StoryBody = {
  text: string;
  bold?: string;
};

export type StoryPhoto =
  | { kind: "image"; src: string; alt: string }
  | { kind: "placeholder"; label: string };

export type CaseStudyRow = {
  num: string;
  heading: AccentHeading;
  body: StoryBody;
  photo: StoryPhoto;
  layout: "photo-left" | "photo-right";
};

export type CaseStudyStat = { num: string; label: string };

export type CaseStudy = {
  slug: string;
  name: string;
  role: string;
  cardImage?: { src: string; alt: string };
  comingSoon?: boolean;
  title?: AccentHeading;
  stats?: CaseStudyStat[];
  rows?: CaseStudyRow[];
  ctaHook?: string;
  publishedAt?: string;
  description?: string;
};

const LEGACY_CASE_STUDIES: CaseStudy[] = [
  {
    slug: "gordon-ly",
    name: "Gordon Ly",
    role: "Tech & AI authority",
    comingSoon: true,
  },
  {
    slug: "adrien-ninet",
    name: "Adrien Ninet",
    role: "Design creator",
    publishedAt: "2026-02-14",
    description:
      "Adrien Ninet is a design creator who scaled his YouTube channel from 12k to 412k subscribers in under a year by partnering with Nexol Media on retention-led editing, sharper hooks, and a vertical clipping engine — without sacrificing his careful, considered tone.",
    cardImage: {
      src: "/case-studies/adrien-ninet.png",
      alt: "Adrien Ninet, design creator who scaled from 12k to 412k YouTube subscribers with Nexol Media",
    },
    title: {
      before: "From 12k subs to ",
      accent: "412k",
      after: ", on his own terms.",
    },
    stats: [
      { num: "+412K", label: "New subscribers" },
      { num: "3.1M", label: "Top video views" },
      { num: "8 wks", label: "To breakout cadence" },
    ],
    rows: [
      {
        num: "01 · The brief",
        heading: {
          before: "Talented, undersized, ready to ",
          accent: "break out",
          after: ".",
        },
        body: {
          text: "Adrien came to us with a small but loyal audience of designers, beautiful taste, and a problem common to every craftsperson on YouTube — videos that took weeks to make and stalled at a few thousand plays. The work was great. The packaging was not.",
          bold: "We wanted to fix that without losing what made him him.",
        },
        photo: {
          kind: "image",
          src: "/case-studies/adrien-ninet.png",
          alt: "Adrien Ninet, design creator who grew from 12k to 412k YouTube subscribers with Nexol Media",
        },
        layout: "photo-right",
      },
      {
        num: "02 · The work",
        heading: {
          before: "Tighter scripts, sharper cuts, weekly cadence.",
        },
        body: {
          text: "We rebuilt his pipeline from the script down. Cold opens under ten seconds. A retention-led edit pass with motion graphics we drew in-house. A vertical clipping engine running off every long-form upload. And a two-on-one-off cadence that finally let the algorithm find him.",
          bold: "Eight weeks in, three videos crossed half a million plays.",
        },
        photo: {
          kind: "placeholder",
          label: "PHOTO · Adrien in studio · landscape 1:1",
        },
        layout: "photo-left",
      },
      {
        num: "03 · The result",
        heading: {
          before: "A breakout year, on his own terms.",
        },
        body: {
          text: "A year later Adrien sits at +412K new subscribers, a brand sponsor on every other upload, and a launch video at 3.1M views — without ever chasing a trend or sacrificing the slow, careful tone of his work. The voice stayed. The numbers caught up.",
        },
        photo: {
          kind: "placeholder",
          label: "PHOTO · Behind-the-scenes · landscape 1:1",
        },
        layout: "photo-right",
      },
    ],
    ctaHook: "Want a year like Adrien's? Let us pitch you one.",
  },
  {
    slug: "leo-de-matos",
    name: "Leo De Matos",
    role: "AI video creator",
    comingSoon: true,
  },
  {
    slug: "mr-pynk",
    name: "Mr. Pynk",
    role: "Podcast host",
    comingSoon: true,
  },
];

/** Migration script only. */
export const __LEGACY_CASE_STUDIES = LEGACY_CASE_STUDIES;

let cachedAll: CaseStudy[] | undefined;

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  if (cachedAll) return cachedAll;
  const client = getSanityClient();
  if (!client) {
    cachedAll = LEGACY_CASE_STUDIES;
    return cachedAll;
  }
  try {
    const raw = await client.fetch<unknown[]>(allCaseStudiesQuery);
    if (!raw || raw.length === 0) {
      cachedAll = LEGACY_CASE_STUDIES;
      return cachedAll;
    }
    cachedAll = (raw as Parameters<typeof transformCaseStudy>[0][]).map(
      transformCaseStudy
    );
    return cachedAll;
  } catch (err) {
    console.warn("[case-studies] Sanity fetch failed; using legacy.", err);
    cachedAll = LEGACY_CASE_STUDIES;
    return cachedAll;
  }
}

export async function getCaseStudy(
  slug: string
): Promise<CaseStudy | undefined> {
  const client = getSanityClient();
  if (client) {
    try {
      const raw = await client.fetch<unknown>(caseStudyBySlugQuery, { slug });
      if (raw)
        return transformCaseStudy(
          raw as Parameters<typeof transformCaseStudy>[0]
        );
    } catch (err) {
      console.warn(
        "[case-studies] getCaseStudy Sanity fetch failed; trying legacy.",
        err
      );
    }
  }
  return LEGACY_CASE_STUDIES.find((c) => c.slug === slug);
}
