import { getSanityClient } from "./sanity/client";
import {
  allBlogPostsQuery,
  blogPostBySlugQuery,
  featuredPostQuery,
} from "./sanity/queries";
import { transformBlogPost } from "./sanity/transform";

export const blogCategories = [
  "All",
  "Growth",
  "Editing",
  "AI tools",
  "Distribution",
  "Behind the scenes",
] as const;
export type BlogCategory = (typeof blogCategories)[number];
export type BlogPostCategory = Exclude<BlogCategory, "All">;

/**
 * Structured body blocks — render via a switch on `kind` so the renderer can
 * apply drop-cap on the first paragraph, numbered h2s, custom OL/UL markers,
 * and pullquotes with a lime accent bar.
 */
export type BlogBlock =
  | { kind: "p"; text: string; dropCap?: boolean }
  | { kind: "h2"; num: string; text: string }
  | { kind: "ol"; items: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "quote"; text: string; by?: string }
  | { kind: "figure"; placeholderLabel: string; caption?: string };

export type BlogAuthor = { name: string; role: string; initials: string };

export type BlogPost = {
  slug: string;
  title: string;
  dek: string;
  category: BlogPostCategory;
  publishedAt: string;
  /** ISO date — defaults to publishedAt in schema.ts when omitted. */
  modifiedAt?: string;
  readTimeMinutes: number;
  author: BlogAuthor;
  tags: string[];
  hero: { kind: "placeholder"; label: string };
  body: BlogBlock[];
  featured?: boolean;
};

/**
 * Posts whose body is only the placeholder paragraph. Used to noindex
 * thin posts and exclude them from the sitemap, blog grid, and archive
 * until real content is written.
 */
export function isThinPost(p: BlogPost): boolean {
  if (p.body.length !== 1) return false;
  const only = p.body[0];
  if (only.kind !== "p") return false;
  return only.text.startsWith("This essay is being finalized");
}

const niteshBandekar: BlogAuthor = {
  name: "Nitesh Bandekar",
  role: "Founder",
  initials: "NB",
};
const vedantJ: BlogAuthor = { name: "Vedant J.", role: "Editor", initials: "VJ" };
const aaravS: BlogAuthor = { name: "Aarav S.", role: "Editor", initials: "AS" };
const leoD: BlogAuthor = { name: "Leo D.", role: "Strategist", initials: "LD" };
const riyaM: BlogAuthor = { name: "Riya M.", role: "Editor", initials: "RM" };

/**
 * Legacy seed data used as fallback when Sanity is not configured yet
 * (or returns an empty dataset). The migration script reads this same
 * array to populate Sanity once on initial setup. After the migration
 * runs and content is owned in Studio, this array can be deleted.
 */
const LEGACY_POSTS: BlogPost[] = [
  {
    slug: "hook-gordon-ly-million-subs",
    title: "The 23-second hook that took Gordon Ly to a million subs.",
    dek: "We rebuilt our hook framework around one question — can you tell what this video is about in the first second of audio, the first second of video, or both. Here is the exact decision tree we now run on every cut, with three before-and-afters from the past month.",
    category: "Growth",
    publishedAt: "2026-05-18",
    readTimeMinutes: 9,
    author: niteshBandekar,
    tags: ["Growth", "Editing", "Retention"],
    hero: { kind: "placeholder", label: "Edit-bay still · Hook session board · 16:9" },
    featured: true,
    body: [
      {
        kind: "p",
        dropCap: true,
        text: "Twenty-three seconds. That is how long it takes a tuned hook to do its job — establish stakes, set expectation, and earn the second minute. Not the second click, the second minute. We rewrote our hook framework around a single test, ran it against the last two hundred uploads from our biggest channels, and got back a number we did not expect.",
      },
      {
        kind: "p",
        text: "The framework is simple to describe and exhausting to apply. Every hook gets graded on whether a viewer can answer one question by the twenty-third second — \"is this video for me, right now, at this moment?\". If the answer is unclear, the hook is broken. The body of the video does not save it. The thumbnail does not save it. The hook is the hook.",
      },
      { kind: "h2", num: "01", text: "The four-question decision tree." },
      {
        kind: "p",
        text: "Before we built the framework, our editors were running on instinct. Some hooks worked, some did not, nobody could tell you in advance which was which. So we wrote down the four questions an editor needs to answer before locking a hook.",
      },
      {
        kind: "ol",
        items: [
          "Can a stranger tell what this video is about in the first second of audio?",
          "Can a stranger tell what this video is about in the first second of video?",
          "Does the hook promise a specific outcome — not a vague \"learn about X\"?",
          "Does the body of the video deliver on that promise inside the first ninety seconds?",
        ],
      },
      {
        kind: "p",
        text: "If you answer no to any of these, the hook fails. We grade hooks against the four questions before we touch the body of the cut. The graded notes go back to the creator for a final sign-off — every time, no exceptions.",
      },
      { kind: "h2", num: "02", text: "Before and after — three real cuts." },
      {
        kind: "p",
        text: "The proof is in the cuts. Here are three hooks we rebuilt in the last thirty days, with the retention curves alongside. The pattern is consistent — the rebuilt hooks hold roughly 18 to 24 percent more of the audience past the ninety-second mark.",
      },
      {
        kind: "figure",
        placeholderLabel: "Retention curve · Hook A vs. Hook B · 30-second window",
        caption: "Hook B holds an extra 22% of viewers past the 90-second mark.",
      },
      {
        kind: "quote",
        text: "We used to argue about hooks. Now we grade them. Arguing produces opinions; grading produces uploads.",
        by: "Nitesh Bandekar · Founder",
      },
      { kind: "h2", num: "03", text: "What you can apply tomorrow." },
      {
        kind: "p",
        text: "You do not need our framework to run this discipline. You need the four questions and a willingness to throw away hooks that fail them. The hardest part is not the writing — it is the throwing-away. Editors get attached. Creators get attached. The audience does not.",
      },
      {
        kind: "ul",
        items: [
          "Grade every hook against the four questions before you cut the body.",
          "If a hook fails, rewrite it. Do not patch it. Patches compound.",
          "Run the grade on the first three hooks of every new channel you take on.",
        ],
      },
      {
        kind: "p",
        text: "The result, run consistently for sixty days, is a measurably tighter top-of-funnel. Gordon went from a 41 percent ninety-second hold to 63 percent across forty-seven videos. We are running the same framework on three more channels right now. We will write up the second one when we have a hundred uploads of data.",
      },
    ],
  },
  {
    slug: "every-cut-tuned-retention",
    title: "Every cut tuned for retention. A frame-by-frame teardown.",
    dek: "Three patterns we steal from broadcast TV — and one we stopped using because it tanked watch time on AI-tutorial content.",
    category: "Editing",
    publishedAt: "2026-05-14",
    readTimeMinutes: 7,
    author: vedantJ,
    tags: ["Editing", "Retention"],
    hero: { kind: "placeholder", label: "Frame teardown · Editing bay · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: broadcast editors solved the retention problem decades ago. The patterns transferred to YouTube long-form with one exception we will explain in full.",
      },
    ],
  },
  {
    slug: "60-days-right-window",
    title: "Why 60 days is the right window to judge a channel.",
    dek: "Anything shorter is noise. Anything longer hides the levers. The clients who let us run a real 60-day window beat the ones who blink at 30.",
    category: "Growth",
    publishedAt: "2026-05-09",
    readTimeMinutes: 6,
    author: niteshBandekar,
    tags: ["Growth", "Operations"],
    hero: { kind: "placeholder", label: "Calendar grid · 60-day timeline · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: 30 days is noise, 90 days is a vacation. 60 days is exactly the window where pattern emerges and discipline still holds.",
      },
    ],
  },
  {
    slug: "ai-helps-editor-slows-us-down",
    title: "Where AI helps an editor, and where it still slows us down.",
    dek: "An honest inventory of the eight tools in our current stack — what we paid for, what we cancelled, and what we built ourselves to plug the gap.",
    category: "AI tools",
    publishedAt: "2026-05-03",
    readTimeMinutes: 11,
    author: aaravS,
    tags: ["AI tools", "Editing", "Tools"],
    hero: { kind: "placeholder", label: "Tool stack overview · Workspace · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: AI eats the routine, then chokes on the judgment. We keep four tools, killed three, and wrote one ourselves.",
      },
    ],
  },
  {
    slug: "clipping-not-optional-anymore",
    title: "Clipping is not optional anymore. A short rant.",
    dek: "If you are publishing a long-form video without a parallel clipping plan, you are leaving roughly one third of your potential reach on the floor. Here is the cheap version of doing it right.",
    category: "Distribution",
    publishedAt: "2026-04-28",
    readTimeMinutes: 4,
    author: leoD,
    tags: ["Distribution", "Clipping"],
    hero: { kind: "placeholder", label: "Vertical clip grid · Phone-first · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: a long-form upload without a clipping plan is a launch without a press release. You shipped, nobody noticed.",
      },
    ],
  },
  {
    slug: "mumbai-edit-bay-tuesday",
    title: "Inside the Mumbai edit bay — a Tuesday at Nexol.",
    dek: "Eight editors, four channels, one shared review board. A walk-through of how a single video moves from upload to shipped in under 72 hours.",
    category: "Behind the scenes",
    publishedAt: "2026-04-21",
    readTimeMinutes: 8,
    author: riyaM,
    tags: ["Behind the scenes", "Operations"],
    hero: { kind: "placeholder", label: "Mumbai studio · Bay overview · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: every video moves through six hands, three review gates, and two thumbnail variants. Tuesday is the busiest day of the week.",
      },
    ],
  },
  {
    slug: "thumbnails-are-a-posture",
    title: "Thumbnails are a posture. Not a checklist.",
    dek: "We used to A/B four variants per video and pick the winner. Then we noticed something — the channels who win the thumbnail game share something deeper than a template.",
    category: "Growth",
    publishedAt: "2026-04-15",
    readTimeMinutes: 5,
    author: niteshBandekar,
    tags: ["Growth", "Thumbnails", "Design"],
    hero: { kind: "placeholder", label: "Thumbnail wall · Grid of 16 · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: thumbnails are how a channel walks into a room. Posture matters more than the outfit.",
      },
    ],
  },
  {
    slug: "boring-framework-next-12-videos",
    title: "A boring framework for picking the next 12 videos on a channel.",
    dek: "Predictability over surprise. A step-by-step system for content planning that removes guesswork and scales.",
    category: "Growth",
    publishedAt: "2026-04-09",
    readTimeMinutes: 5,
    author: niteshBandekar,
    tags: ["Growth", "Planning"],
    hero: { kind: "placeholder", label: "Planning whiteboard · 12-up grid · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: boring scales. Surprise does not.",
      },
    ],
  },
  {
    slug: "three-editors-one-brief",
    title: "Three editors, one brief — we ran the same video three ways.",
    dek: "Same source footage, same brief, three completely different cuts. Here's what we learned about style, pacing, and the myth of the 'right way' to edit.",
    category: "Editing",
    publishedAt: "2026-04-02",
    readTimeMinutes: 7,
    author: vedantJ,
    tags: ["Editing", "Experiment"],
    hero: { kind: "placeholder", label: "Triptych frames · A/B/C cuts · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: three editors, three cuts, three different retention curves. Style is a real variable.",
      },
    ],
  },
  {
    slug: "podcast-distribution-underpriced",
    title: "Podcast distribution is the most underpriced thing we do.",
    dek: "The channels sleeping on podcast syndication are leaving money and audience on the table. Here's why it works and how to start.",
    category: "Distribution",
    publishedAt: "2026-03-24",
    readTimeMinutes: 6,
    author: leoD,
    tags: ["Distribution", "Podcast"],
    hero: { kind: "placeholder", label: "Multi-surface fan-out · Diagram · 16:9" },
    body: [
      {
        kind: "p",
        text: "This essay is being finalized — the long version goes live next week. The short version: one record, ten surfaces. We have not found the ceiling yet.",
      },
    ],
  },
];

/** Exposed for the migration script only. */
export const __LEGACY_BLOG_POSTS = LEGACY_POSTS;

/**
 * Module-level cache. Subsequent fetches in the same server request reuse
 * the result. Cleared between requests by the Node process boundary.
 */
let cachedAll: BlogPost[] | undefined;

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (cachedAll) return cachedAll;
  const client = getSanityClient();
  if (!client) {
    cachedAll = LEGACY_POSTS;
    return cachedAll;
  }
  try {
    const raw = await client.fetch<unknown[]>(allBlogPostsQuery);
    if (!raw || raw.length === 0) {
      cachedAll = LEGACY_POSTS;
      return cachedAll;
    }
    cachedAll = (raw as Parameters<typeof transformBlogPost>[0][]).map(
      transformBlogPost
    );
    return cachedAll;
  } catch (err) {
    console.warn("[blog] Sanity fetch failed; using legacy seed.", err);
    cachedAll = LEGACY_POSTS;
    return cachedAll;
  }
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const client = getSanityClient();
  if (client) {
    try {
      const raw = await client.fetch<unknown>(blogPostBySlugQuery, { slug });
      if (raw)
        return transformBlogPost(
          raw as Parameters<typeof transformBlogPost>[0]
        );
    } catch (err) {
      console.warn("[blog] getPost Sanity fetch failed; trying legacy.", err);
    }
  }
  return LEGACY_POSTS.find((p) => p.slug === slug);
}

export async function getFeaturedPost(): Promise<BlogPost | undefined> {
  const client = getSanityClient();
  if (client) {
    try {
      const raw = await client.fetch<unknown>(featuredPostQuery);
      if (raw)
        return transformBlogPost(
          raw as Parameters<typeof transformBlogPost>[0]
        );
    } catch (err) {
      console.warn("[blog] featured Sanity fetch failed; using legacy.", err);
    }
  }
  return LEGACY_POSTS.find((p) => p.featured) ?? LEGACY_POSTS[0];
}

export async function getRecentPosts(count = 5): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  const featured = all.find((p) => p.featured);
  return sortByDateDesc(all.filter((p) => p.slug !== featured?.slug)).slice(
    0,
    count
  );
}

export async function getRelatedPosts(
  post: BlogPost,
  count = 3
): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  const others = all.filter((p) => p.slug !== post.slug);
  const sameCategory = others.filter((p) => p.category === post.category);
  const rest = others.filter((p) => p.category !== post.category);
  return [...sortByDateDesc(sameCategory), ...sortByDateDesc(rest)].slice(
    0,
    count
  );
}

export async function getArchive(): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  return sortByDateDesc(all);
}

export async function getCategoryCount(
  category: BlogCategory
): Promise<number> {
  const all = await getAllBlogPosts();
  if (category === "All") return all.length;
  return all.filter((p) => p.category === category).length;
}

function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function formatPostDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatPostDateLong(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
