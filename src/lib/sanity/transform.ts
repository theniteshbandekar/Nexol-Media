import type {
  BlogAuthor,
  BlogBlock,
  BlogPost,
  BlogPostCategory,
} from "@/lib/blog";
import type {
  AccentHeading,
  CaseStudy,
  CaseStudyRow,
  CaseStudyStat,
  StoryBody,
  StoryPhoto,
} from "@/lib/case-studies";
import type {
  Service,
  ServiceDeliverable,
  ServiceFaq,
  ServiceMetric,
  ServiceProcessStep,
  ServiceSlug,
  ServiceWorkSample,
} from "@/lib/services";

import { urlFor } from "./image";

/** Sanity-side image shape. */
type SanityImage = {
  asset?: { _ref?: string; _id?: string };
  alt?: string;
  _type?: "image";
};

function imageUrl(img: SanityImage | undefined): string | undefined {
  if (!img) return undefined;
  const builder = urlFor(img);
  return builder?.url() ?? undefined;
}

/* ============================================================
   BLOG
   ============================================================ */

type SanityBlogPost = {
  slug: string;
  title: string;
  dek: string;
  category: BlogPostCategory;
  publishedAt: string;
  modifiedAt?: string;
  readTimeMinutes: number;
  tags?: string[];
  featured?: boolean;
  author: { name: string; role: string; initials: string };
  heroImage?: SanityImage;
  heroLabel?: string;
  body?: SanityBodyBlock[];
};

type SanityBodyBlock =
  // Portable text block
  | {
      _type: "block";
      style?: string;
      listItem?: "bullet" | "number";
      children?: Array<{ text?: string; marks?: string[]; _type?: string }>;
      markDefs?: Array<{ _key: string; _type?: string }>;
    }
  // Figure object
  | {
      _type: "figure";
      image?: SanityImage;
      placeholderLabel?: string;
      caption?: string;
    }
  // Pull quote object
  | {
      _type: "pullquote";
      text: string;
      by?: string;
    };

export function transformBlogPost(raw: SanityBlogPost): BlogPost {
  return {
    slug: raw.slug,
    title: raw.title,
    dek: raw.dek,
    category: raw.category,
    publishedAt: raw.publishedAt
      ? raw.publishedAt.slice(0, 10)
      : "",
    modifiedAt: raw.modifiedAt ? raw.modifiedAt.slice(0, 10) : undefined,
    readTimeMinutes: raw.readTimeMinutes,
    author: raw.author as BlogAuthor,
    tags: raw.tags ?? [],
    hero: { kind: "placeholder", label: raw.heroLabel ?? "Hero" },
    body: transformBlogBody(raw.body ?? []),
    featured: raw.featured,
  };
}

function transformBlogBody(raw: SanityBodyBlock[]): BlogBlock[] {
  const out: BlogBlock[] = [];
  let droppedCap = false;

  for (const block of raw) {
    if (block._type === "block") {
      const text = (block.children ?? [])
        .map((c) => c.text ?? "")
        .join("")
        .trim();
      if (!text) continue;

      // List items
      if (block.listItem === "number") {
        const last = out[out.length - 1];
        if (last && last.kind === "ol") last.items.push(text);
        else out.push({ kind: "ol", items: [text] });
        continue;
      }
      if (block.listItem === "bullet") {
        const last = out[out.length - 1];
        if (last && last.kind === "ul") last.items.push(text);
        else out.push({ kind: "ul", items: [text] });
        continue;
      }

      // Block styles
      if (block.style === "h2") {
        // Extract leading "(NN)" if present in the text
        const numMatch = text.match(/^\((\d+)\)\s*/);
        if (numMatch) {
          out.push({
            kind: "h2",
            num: numMatch[1].padStart(2, "0"),
            text: text.replace(numMatch[0], "").trim(),
          });
        } else {
          out.push({
            kind: "h2",
            num: String(out.filter((b) => b.kind === "h2").length + 1).padStart(2, "0"),
            text,
          });
        }
        continue;
      }
      if (block.style === "blockquote") {
        out.push({ kind: "quote", text });
        continue;
      }

      // Regular paragraph
      const dropCap = !droppedCap && hasDropCapMark(block);
      if (dropCap) droppedCap = true;
      out.push({ kind: "p", text, dropCap: dropCap || undefined });
      continue;
    }

    if (block._type === "figure") {
      out.push({
        kind: "figure",
        placeholderLabel: block.placeholderLabel ?? block.image?.alt ?? "Figure",
        caption: block.caption,
      });
      continue;
    }
    if (block._type === "pullquote") {
      out.push({ kind: "quote", text: block.text, by: block.by });
      continue;
    }
  }

  return out;
}

function hasDropCapMark(
  block: Extract<SanityBodyBlock, { _type: "block" }>
): boolean {
  return (
    block.children?.some((c) => c.marks?.includes("dropCap")) ?? false
  );
}

/* ============================================================
   CASE STUDIES
   ============================================================ */

type SanityCaseStudy = {
  slug: string;
  name: string;
  role: string;
  description?: string;
  publishedAt?: string;
  comingSoon?: boolean;
  cardImage?: SanityImage;
  title?: AccentHeading;
  stats?: CaseStudyStat[];
  rows?: Array<{
    num: string;
    heading: AccentHeading;
    body: StoryBody;
    photo: {
      kind: "image" | "placeholder";
      image?: SanityImage;
      label?: string;
    };
    layout: "photo-left" | "photo-right";
  }>;
  ctaHook?: string;
};

export function transformCaseStudy(raw: SanityCaseStudy): CaseStudy {
  return {
    slug: raw.slug,
    name: raw.name,
    role: raw.role,
    description: raw.description,
    publishedAt: raw.publishedAt ? raw.publishedAt.slice(0, 10) : undefined,
    comingSoon: raw.comingSoon,
    cardImage: raw.cardImage
      ? {
          src: imageUrl(raw.cardImage) ?? "",
          alt: raw.cardImage.alt ?? `${raw.name} — Nexol Media case study`,
        }
      : undefined,
    title: raw.title,
    stats: raw.stats,
    rows: raw.rows?.map<CaseStudyRow>((row) => ({
      num: row.num,
      heading: row.heading,
      body: row.body,
      photo: transformStoryPhoto(row.photo, raw.name),
      layout: row.layout,
    })),
    ctaHook: raw.ctaHook,
  };
}

type SanityStoryPhoto = {
  kind: "image" | "placeholder";
  image?: SanityImage;
  label?: string;
};

function transformStoryPhoto(
  photo: SanityStoryPhoto,
  fallbackName: string
): StoryPhoto {
  if (photo.kind === "image" && photo.image) {
    return {
      kind: "image",
      src: imageUrl(photo.image) ?? "",
      alt: photo.image.alt ?? `${fallbackName} — Nexol Media`,
    };
  }
  return { kind: "placeholder", label: photo.label ?? "Photo" };
}

/* ============================================================
   SERVICES
   ============================================================ */

type SanityService = {
  slug: ServiceSlug;
  num: string;
  title: string;
  tagline: string;
  pills?: string[];
  description: string;
  deliverablesMeta?: string;
  deliverables: ServiceDeliverable[];
  workHeading?: string;
  workMeta?: string;
  workSamples?: Array<{
    label: string;
    image?: SanityImage;
    caseStudySlug?: string;
  }>;
  metricsMeta?: string;
  metrics: ServiceMetric[];
  processMeta?: string;
  process: ServiceProcessStep[];
  ctaHeading?: string;
  faqs?: ServiceFaq[];
};

export function transformService(raw: SanityService): Service {
  // Service requires tuple types of length 3 — we trust the schema.
  const deliverables = raw.deliverables.slice(0, 3) as Service["deliverables"];
  const metrics = raw.metrics.slice(0, 3) as Service["metrics"];

  return {
    slug: raw.slug,
    num: raw.num,
    title: raw.title,
    tagline: raw.tagline,
    pills: raw.pills ?? [],
    description: raw.description,
    deliverablesMeta: raw.deliverablesMeta ?? "",
    deliverables,
    workHeading: raw.workHeading ?? "",
    workMeta: raw.workMeta ?? "",
    workSamples: (raw.workSamples ?? []).map<ServiceWorkSample>((w) => ({
      kind: "placeholder",
      label: w.label,
      caseStudySlug: w.caseStudySlug,
    })),
    metricsMeta: raw.metricsMeta ?? "",
    metrics,
    processMeta: raw.processMeta ?? "",
    process: raw.process,
    ctaHeading: raw.ctaHeading ?? "",
    faqs: raw.faqs,
  };
}
