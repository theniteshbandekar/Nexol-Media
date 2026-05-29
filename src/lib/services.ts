import { cache } from "react";

import { getAdminDb } from "./firebase/admin";
import { COLLECTIONS } from "./firebase/collections";

/** One deliverable card on a service detail page. */
export type ServiceDeliverable = {
  title: string;
  description: string;
  bullets: string[];
};

/** One step in the "How an engagement runs" timeline. */
export type ServiceProcessStep = {
  num: string;
  week: string;
  title: string;
  description: string;
};

/** A single metric on the "Numbers we have moved" block. */
export type ServiceMetric = {
  num: string;
  label: string;
  context?: string;
};

/**
 * A placeholder card in the "Recent work" gallery.
 * `caseStudySlug` lights up the card as a link to the matching case study when set.
 */
export type ServiceWorkSample = {
  kind: "placeholder";
  label: string;
  caseStudySlug?: string;
};

// Relaxed to `string` so new services can be created from the admin dashboard
// (the original 5 canonical slugs remain valid strings).
export type ServiceSlug = string;

/** A single Q+A on a service detail page — wired into FAQPage schema. */
export type ServiceFaq = { q: string; a: string };

export type Service = {
  slug: ServiceSlug;
  num: string;
  title: string;
  tagline: string;
  pills: string[];
  description: string;
  deliverablesMeta: string;
  deliverables: [ServiceDeliverable, ServiceDeliverable, ServiceDeliverable];
  workHeading: string;
  workMeta: string;
  workSamples: ServiceWorkSample[];
  metricsMeta: string;
  metrics: [ServiceMetric, ServiceMetric, ServiceMetric];
  processMeta: string;
  process: ServiceProcessStep[];
  ctaHeading: string;
  /** Optional FAQ — rendered on the page and emitted as FAQPage schema. */
  faqs?: ServiceFaq[];
};

const LEGACY_SERVICES: Service[] = [
  {
    slug: "personal-brand",
    num: "01",
    title: "Personal Brand",
    tagline:
      "We turn experts into characters audiences recognize within the first second of any clip. Strategy, on-camera direction, and a visual system you can run for years.",
    pills: ["Strategy", "Direction", "Recurring"],
    description:
      "We turn experts into characters audiences recognize within the first second of any clip.",
    deliverablesMeta: "3 deliverables · monthly retainer",
    deliverables: [
      {
        title: "Channel positioning",
        description:
          "A one-paragraph north star you can read aloud, and we will hold every video against it.",
        bullets: [
          "Audience definition",
          "Editorial pillars",
          "Three signature formats",
        ],
      },
      {
        title: "Visual system",
        description:
          "The look that makes a clip yours before anyone sees the face — color, type, lower-thirds, transitions.",
        bullets: [
          "Color palette + LUTs",
          "Typographic system",
          "Graphics kit",
        ],
      },
      {
        title: "On-camera direction",
        description:
          "A coach on every recording day. We bring camera plans, prompts, and the discipline to do another take.",
        bullets: [
          "Pre-shoot scripts",
          "Live remote direction",
          "Notes inside 24 hours",
        ],
      },
    ],
    workHeading: "Recognized in one second.",
    workMeta: "Recent samples · Personal Brand",
    workSamples: [
      { kind: "placeholder", label: "Channel style frame v3" },
      { kind: "placeholder", label: "Lower-third system" },
      { kind: "placeholder", label: "Cold open series A" },
      {
        kind: "placeholder",
        label: "Format review desk",
        caseStudySlug: "adrien-ninet",
      },
      { kind: "placeholder", label: "Format whiteboard" },
    ],
    metricsMeta: "Last 12 months",
    metrics: [
      {
        num: "+58%",
        label: "30-day retention",
        context: "Across 12 channels we positioned in 2025",
      },
      {
        num: "3.2×",
        label: "Inbound DM rate",
        context: "After the visual rebuild",
      },
      {
        num: "60",
        label: "Day default window",
        context: "Renew, evolve scope, or part cleanly",
      },
    ],
    processMeta: "60-day default",
    process: [
      {
        num: "01",
        week: "Week 01",
        title: "Audit the last 30 uploads.",
        description:
          "We pull patterns, identify the three things we will move first, and write the positioning paragraph.",
      },
      {
        num: "02",
        week: "Week 02",
        title: "Build the system.",
        description:
          "Color, type, lower-thirds, three signature formats. Delivered as a single style frame doc you keep.",
      },
      {
        num: "03",
        week: "Weeks 03–08",
        title: "Ship and direct.",
        description:
          "On every record, every cut, every thumbnail. Friday reviews against the numbers we set on day one.",
      },
      {
        num: "04",
        week: "Day 60",
        title: "Hand it back.",
        description:
          "You keep the system, the LUTs, the graphics kit. Renew with us or run it in-house — either is fine.",
      },
    ],
    ctaHeading: "Ready to start with personal brand?",
  },

  {
    slug: "post-production",
    num: "02",
    title: "Post Production",
    tagline:
      "Full-service editing for long-form YouTube. Color, sound, motion graphics, thumbnails — treated as one craft, not five. We hold every cut against the only metric that matters: did people stay.",
    pills: ["Editing", "Color · Sound", "Motion", "Thumbnails"],
    description:
      "Full-service editing. Every cut tuned for retention, not for the editor's portfolio.",
    deliverablesMeta: "3 deliverables · monthly retainer",
    deliverables: [
      {
        title: "Editing",
        description:
          "Hook-first cuts on our 4-question framework. Two revision rounds. Same-week turnaround.",
        bullets: [
          "Scripts ingested in 24 hr",
          "First cut in 72 hr",
          "Two revision rounds",
        ],
      },
      {
        title: "Color + sound",
        description:
          "Per-channel LUTs, dialogue restoration, broadcast-loudness mix. The boring parts that make the polish.",
        bullets: [
          "Custom channel LUT",
          "Dialogue cleanup",
          "-14 LUFS final mix",
        ],
      },
      {
        title: "Motion + thumbs",
        description:
          "In-house motion design for explainers, B-roll inserts, and the thumbnail that earns the click.",
        bullets: [
          "Lower-thirds + supers",
          "Inline explainer animations",
          "3 thumbnail variants per video",
        ],
      },
    ],
    workHeading: "Every cut tuned for retention.",
    workMeta: "Recent samples · Post Production",
    workSamples: [
      { kind: "placeholder", label: "Hook teardown before/after" },
      { kind: "placeholder", label: "Thumbnail 3 variants" },
      { kind: "placeholder", label: "Inline motion explainer" },
      { kind: "placeholder", label: "Color LUT 03" },
      {
        kind: "placeholder",
        label: "Long-form 18:32",
        caseStudySlug: "adrien-ninet",
      },
    ],
    metricsMeta: "Last 12 months",
    metrics: [
      {
        num: "+41%",
        label: "Avg. view duration",
        context: "First 60 days · 28-video study",
      },
      {
        num: "987k",
        label: "Gordon Ly · subs",
        context: "Crossed 1M in May 2026",
      },
      {
        num: "72 hr",
        label: "First-cut turnaround",
        context: "From upload to draft",
      },
    ],
    processMeta: "60-day default",
    process: [
      {
        num: "01",
        week: "Day 01",
        title: "Brief + assets.",
        description:
          "You drop footage in our shared folder. We confirm scope and lock the hook angle in the same thread.",
      },
      {
        num: "02",
        week: "Day 02",
        title: "Hook lock.",
        description:
          "A 30-second hook draft goes back for your sign-off before we spend any time on the body.",
      },
      {
        num: "03",
        week: "Day 03",
        title: "First cut.",
        description:
          "Full draft delivered with color, sound, supers, and 3 thumbnail variants — all in one frame.io review.",
      },
      {
        num: "04",
        week: "Day 05",
        title: "Final + ship.",
        description:
          "Two revision rounds settle inside 48 hours. We hand off the master, the thumb, and the description.",
      },
    ],
    ctaHeading: "Ready to start with post production?",
  },

  {
    slug: "podcast-distribution",
    num: "03",
    title: "Podcast Distribution",
    tagline:
      "You record once. We ship the YouTube upload, the vertical clips, the native posts, the newsletter blurb, and the website transcript. The most under-priced thing we do.",
    pills: ["YouTube", "Verticals", "Newsletter"],
    description:
      "One conversation, ten distribution surfaces. We ship the full stack from a single record.",
    deliverablesMeta: "3 deliverables · monthly retainer",
    deliverables: [
      {
        title: "YouTube upload",
        description:
          "Full episode cut for YouTube — chaptered, color-graded, thumbnail-ready, description written.",
        bullets: [
          "Multicam edit",
          "Chapter markers",
          "SEO-tuned description",
        ],
      },
      {
        title: "Vertical clip pack",
        description:
          "Six to ten verticals per episode, captioned, posted natively across Reels, Shorts, and TikTok.",
        bullets: [
          "6–10 clips per episode",
          "Native captions",
          "Posted natively, not cross-shared",
        ],
      },
      {
        title: "Newsletter + transcript",
        description:
          "A 300-word newsletter blurb and a clean searchable transcript for your site. SEO-tuned.",
        bullets: [
          "300-word episode blurb",
          "Speaker-attributed transcript",
          "Show-notes formatting",
        ],
      },
    ],
    workHeading: "One conversation, ten surfaces.",
    workMeta: "Recent samples · Podcast Distribution",
    workSamples: [
      {
        kind: "placeholder",
        label: "Episode YouTube 1:08:14",
        caseStudySlug: "mr-pynk",
      },
      { kind: "placeholder", label: "Vertical clip 03" },
      { kind: "placeholder", label: "Vertical clip 07" },
      { kind: "placeholder", label: "Newsletter blurb" },
      { kind: "placeholder", label: "Transcript ep. 42" },
    ],
    metricsMeta: "Last 12 months",
    metrics: [
      {
        num: "+220%",
        label: "Cross-platform reach",
        context: "vs. YouTube-only baseline",
      },
      {
        num: "10",
        label: "Distribution surfaces",
        context: "Per single record",
      },
      {
        num: "48 hr",
        label: "Record to shipped",
        context: "From raw upload to all surfaces",
      },
    ],
    processMeta: "60-day default",
    process: [
      {
        num: "01",
        week: "Day 01",
        title: "Record + drop.",
        description:
          "You record, drop the raw multi-track in our folder. We confirm scope and pick the angle.",
      },
      {
        num: "02",
        week: "Day 02",
        title: "YouTube cut.",
        description:
          "Full long-form edit, chaptered and graded, in your review by end of day two.",
      },
      {
        num: "03",
        week: "Day 03",
        title: "Verticals + copy.",
        description:
          "Six to ten verticals captioned and ready, plus the newsletter blurb and the transcript.",
      },
      {
        num: "04",
        week: "Day 04",
        title: "Ship native.",
        description:
          "We post natively on each platform — never cross-shared — and report the first 72-hour numbers.",
      },
    ],
    ctaHeading: "Ready to start with podcast distribution?",
  },

  {
    slug: "launch-videos",
    num: "04",
    title: "Launch Videos",
    tagline:
      "A polished feature video for the moment that matters — product launch, fundraise, category announcement. Fixed scope, two to three weeks, one master deliverable plus a vertical cutdown.",
    pills: ["Fixed-scope", "Script", "2 – 3 weeks"],
    description:
      "Polished feature videos for product launches, fundraises and category announcements.",
    deliverablesMeta: "3 deliverables · fixed scope",
    deliverables: [
      {
        title: "Script + storyboard",
        description:
          "A working script on our six-beat structure, plus a shot-by-shot board you sign off before we roll.",
        bullets: [
          "Six-beat structure",
          "Shot-by-shot board",
          "Final script lock",
        ],
      },
      {
        title: "Production + edit",
        description:
          "Remote-directed shoot or studio-recorded VO. Color, sound, motion graphics, music license included.",
        bullets: [
          "Remote / studio shoot",
          "Master deliverable",
          "60s vertical cutdown",
        ],
      },
      {
        title: "Launch assets",
        description:
          "Thumbnails, Twitter hero, autoplay GIF, captioned subtitled SRT — the full kit your launch team needs.",
        bullets: [
          "SRT + open captions",
          "Twitter / X hero frame",
          "Looping autoplay GIF",
        ],
      },
    ],
    workHeading: "Six beats, in order, every time.",
    workMeta: "Recent samples · Launch Videos",
    workSamples: [
      { kind: "placeholder", label: "Launch series A 1:48" },
      { kind: "placeholder", label: "Storyboard v3" },
      { kind: "placeholder", label: "Vertical cutdown 0:60" },
      { kind: "placeholder", label: "Master graded" },
      { kind: "placeholder", label: "Hero Twitter/X" },
    ],
    metricsMeta: "Last 12 months",
    metrics: [
      {
        num: "2 – 3 wk",
        label: "Kickoff to delivery",
        context: "Fixed-scope, fixed timeline",
      },
      {
        num: "12+",
        label: "Launches shipped",
        context: "Series A, B, and category launches",
      },
      {
        num: "6",
        label: "Beats per script",
        context: "Same structure, every time",
      },
    ],
    processMeta: "2 – 3 week fixed scope",
    process: [
      {
        num: "01",
        week: "Week 01",
        title: "Brief + script.",
        description:
          "Kickoff call, then two script passes. By Friday you have a working script and a shot board.",
      },
      {
        num: "02",
        week: "Week 02",
        title: "Shoot + assemble.",
        description:
          "Remote-directed shoot or studio VO. Assembly cut by end of week with color and sound in flight.",
      },
      {
        num: "03",
        week: "Week 03",
        title: "Final + assets.",
        description:
          "Two revision rounds. Final master, vertical cutdown, hero frame, GIF, SRT — all delivered by Friday.",
      },
      {
        num: "04",
        week: "Day of",
        title: "Launch support.",
        description:
          "On launch day a producer is on-call to ship resizes, alt cuts, and tweaks within the hour.",
      },
    ],
    ctaHeading: "Ready to start with launch videos?",
  },

  {
    slug: "clipping",
    num: "05",
    title: "Clipping",
    tagline:
      "We pull vertical clips from your long-form uploads and ship them daily to TikTok, Reels, and Shorts. Native posts, native captions, native pacing — not a 9:16 crop of your YouTube video.",
    pills: ["Verticals", "Daily", "Reels · Shorts · TikTok"],
    description:
      "We pull verticals from your long-form and ship them daily — the cheapest reach you will buy.",
    deliverablesMeta: "3 deliverables · monthly retainer",
    deliverables: [
      {
        title: "Daily clip output",
        description:
          "Three to five verticals per day from your most recent uploads. Captioned, hooked, formatted per platform.",
        bullets: [
          "3–5 verticals per day",
          "Per-platform pacing",
          "Native captions, not auto-burn",
        ],
      },
      {
        title: "Native posting",
        description:
          "We post natively from your accounts — never cross-shared — so the algorithm treats them as first-party content.",
        bullets: [
          "Direct from your account",
          "Per-platform metadata",
          "Optimal-window scheduling",
        ],
      },
      {
        title: "Weekly report",
        description:
          "Friday report on what worked, what flopped, and what we are doubling down on. Two-page maximum.",
        bullets: [
          "Top + bottom 3 clips",
          "Hook patterns that won",
          "Plan for next week",
        ],
      },
    ],
    workHeading: "The cheapest reach you will buy.",
    workMeta: "Recent samples · Clipping",
    workSamples: [
      {
        kind: "placeholder",
        label: "Clip 0:42 · 1.2M views",
        caseStudySlug: "leo-de-matos",
      },
      { kind: "placeholder", label: "Clip 0:18" },
      { kind: "placeholder", label: "Clip 0:31" },
      { kind: "placeholder", label: "Caption system" },
      { kind: "placeholder", label: "Weekly report w22" },
    ],
    metricsMeta: "Last 12 months",
    metrics: [
      {
        num: "+800k",
        label: "Added monthly views",
        context: "Leo De Matos · AI video",
      },
      {
        num: "3 – 5",
        label: "Verticals per day",
        context: "Across TikTok, Reels, Shorts",
      },
      {
        num: "90%",
        label: "Of clips posted in 24 hr",
        context: "From your YouTube upload going live",
      },
    ],
    processMeta: "60-day default",
    process: [
      {
        num: "01",
        week: "Week 01",
        title: "Learn the voice.",
        description:
          "We watch the last 10 uploads, lock the caption system, and decide which moments earn a vertical.",
      },
      {
        num: "02",
        week: "Daily",
        title: "Pull + cut.",
        description:
          "Your editor flags moments. Our team builds, captions, and ships within 24 hours of the source upload.",
      },
      {
        num: "03",
        week: "Daily",
        title: "Post native.",
        description:
          "Directly from your account on each platform. We schedule for the platform-specific best window.",
      },
      {
        num: "04",
        week: "Fridays",
        title: "Report + adjust.",
        description:
          "Two-page weekly. Top 3, bottom 3, the patterns that hit, the plan for next week.",
      },
    ],
    ctaHeading: "Ready to start with clipping?",
    faqs: [
      {
        q: "What is a clipping service and how is it different from posting verticals?",
        a: "A clipping service pulls 3–5 vertical clips per day from your long-form uploads and posts them natively on TikTok, Reels, and Shorts — captioned for the platform, paced for the algorithm, and treated as first-party content. It is different from cropping a 9:16 from your YouTube video because the hooks, pacing, and captions are rebuilt for vertical from the ground up.",
      },
      {
        q: "How many clips per day do you produce?",
        a: "Three to five verticals per day from your most recent long-form uploads. We pick the moments that earn a vertical, build them, caption them, and ship them within 24 hours of the source video going live.",
      },
      {
        q: "Which platforms do you post to — TikTok, Reels, Shorts?",
        a: "All three. We post natively from your accounts on TikTok, Instagram Reels, and YouTube Shorts. We never cross-share — every platform gets a clip built for its own pacing and metadata so the algorithm treats it as first-party content.",
      },
      {
        q: "Do you post natively from our accounts or cross-share?",
        a: "Natively, always. Cross-shared clips get throttled by the algorithm. We schedule each platform for its own optimal posting window and use per-platform captions and metadata.",
      },
      {
        q: "How is the clipping service priced?",
        a: "Monthly retainer, scoped to volume and complexity. The default engagement is a 60-day window. We share a clear range on the intro call once we have seen one or two of your long-form uploads. No long-term contracts.",
      },
    ],
  },
];

/** Migration script only. */
export const __LEGACY_SERVICES = LEGACY_SERVICES;

// React cache() = per-render dedup only, so revalidation always re-reads.
export const getAllServices = cache(async (): Promise<Service[]> => {
  try {
    const snap = await getAdminDb().collection(COLLECTIONS.services).get();
    if (snap.empty) return LEGACY_SERVICES;
    return snap.docs
      .map((d) => d.data() as Service & { published?: boolean })
      .filter((s) => s.published !== false)
      // Firestore default order is by slug (alphabetical) — sort by num.
      .sort((a, b) => a.num.localeCompare(b.num));
  } catch (err) {
    console.warn("[services] Firestore fetch failed; using legacy.", err);
    return LEGACY_SERVICES;
  }
});

export const getService = cache(
  async (slug: string): Promise<Service | undefined> => {
    try {
      const doc = await getAdminDb()
        .collection(COLLECTIONS.services)
        .doc(slug)
        .get();
      if (doc.exists) {
        const data = doc.data() as Service & { published?: boolean };
        return data.published === false ? undefined : data;
      }
    } catch (err) {
      console.warn(
        "[services] getService Firestore fetch failed; trying legacy.",
        err
      );
    }
    return LEGACY_SERVICES.find((s) => s.slug === slug);
  }
);
