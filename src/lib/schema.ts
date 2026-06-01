import type { BlogPost } from "@/lib/blog";
import type { CaseStudy } from "@/lib/case-studies";
import type { Service } from "@/lib/services";

// Env-driven so App Hosting preview/staging deployments emit their own URL in
// canonicals/sitemap/robots/JSON-LD instead of the production domain. Falls back
// to the production domain when NEXT_PUBLIC_SITE_URL is unset (e.g. local dev).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexolmedia.com"
).replace(/\/$/, "");
export const SITE_NAME = "Nexol Media";
export const SITE_TWITTER = "@nexolmedia";

type Json = Record<string, unknown>;

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function ogImageFor(path: string): string {
  return `${absoluteUrl(path)}/opengraph-image`;
}

export function organizationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.png"),
      width: 512,
      height: 512,
    },
    description:
      "A media studio for Tech, AI and Design creators. Editing, personal brand, podcast distribution, launch videos, and clipping.",
    foundingLocation: {
      "@type": "Place",
      name: "Mumbai",
    },
    areaServed: "Worldwide",
    sameAs: [
      "https://www.instagram.com/nexolmedia",
      "https://x.com/nexolmedia",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "info@nexolmedia.com",
        telephone: "+91-705-802-5578",
        contactType: "customer service",
        areaServed: "Worldwide",
        availableLanguage: ["en"],
      },
    ],
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: "en",
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function personSchema(study: CaseStudy): Json {
  const path = `/case-studies/${study.slug}`;
  const description =
    study.description ??
    (study.rows?.[0]?.body.text
      ? `${study.role}. ${study.rows[0].body.text.slice(0, 200)}…`
      : `${study.role}. A creator we partner with at Nexol Media.`);
  const image = study.cardImage?.src
    ? absoluteUrl(study.cardImage.src)
    : ogImageFor(path);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${absoluteUrl(path)}#person`,
    name: study.name,
    jobTitle: study.role,
    description,
    image,
    url: absoluteUrl(path),
    knowsAbout: [
      "YouTube",
      "Content creation",
      "Video editing",
      study.role,
    ],
    subjectOf: {
      "@type": "Article",
      "@id": `${absoluteUrl(path)}#article`,
      headline:
        study.title
          ? [study.title.before, study.title.accent, study.title.after]
              .filter(Boolean)
              .join("")
              .trim()
          : `${study.name} — Nexol Media case study`,
    },
  };
}

export function caseStudyArticleSchema(study: CaseStudy): Json {
  const path = `/case-studies/${study.slug}`;
  const headline = study.title
    ? [study.title.before, study.title.accent, study.title.after]
        .filter(Boolean)
        .join("")
        .trim()
    : `${study.name} — Nexol Media case study`;
  const image = study.cardImage?.src
    ? absoluteUrl(study.cardImage.src)
    : ogImageFor(path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#article`,
    headline,
    description: `${study.name} · ${study.role}. A Nexol Media case study covering strategy, editing, and creator growth.`,
    image,
    datePublished: study.publishedAt ?? "2026-01-01",
    dateModified: study.publishedAt ?? "2026-01-01",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}#website` },
    publisher: { "@id": `${SITE_URL}#organization` },
    author: { "@id": `${SITE_URL}#organization` },
    about: { "@id": `${absoluteUrl(path)}#person` },
    mainEntityOfPage: absoluteUrl(path),
  };
}

export function articleSchema(post: BlogPost): Json {
  const path = `/blog/${post.slug}`;
  const wordCount = countWords(post);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(path)}#article`,
    headline: post.title,
    description: post.dek,
    image: ogImageFor(path),
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt ?? post.publishedAt,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    wordCount,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}#website` },
    publisher: { "@id": `${SITE_URL}#organization` },
    mainEntityOfPage: absoluteUrl(path),
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      worksFor: { "@id": `${SITE_URL}#organization` },
    },
  };
}

export function serviceSchema(service: Service): Json {
  const path = `/services/${service.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name: service.title,
    serviceType: service.title,
    description: service.tagline,
    provider: { "@id": `${SITE_URL}#organization` },
    areaServed: "Worldwide",
    audience: {
      "@type": "Audience",
      audienceType: "Tech, AI, and Design creators",
    },
    url: absoluteUrl(path),
    image: ogImageFor(path),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "PriceSpecification",
        description: "Monthly retainer — scoped to volume and complexity.",
      },
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/contact"),
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.title} deliverables`,
      itemListElement: service.deliverables.map((d, i) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: {
          "@type": "Service",
          name: d.title,
          description: d.description,
        },
      })),
    },
  };
}

export function faqSchema(items: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function itemListSchema(
  name: string,
  items: { url: string; name: string }[]
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(it.url),
      name: it.name,
    })),
  };
}

function countWords(post: BlogPost): number {
  let n = 0;
  for (const block of post.body) {
    if (block.kind === "p") n += block.text.split(/\s+/).length;
    else if (block.kind === "h2") n += block.text.split(/\s+/).length;
    else if (block.kind === "ol" || block.kind === "ul") {
      for (const item of block.items) n += item.split(/\s+/).length;
    } else if (block.kind === "quote") n += block.text.split(/\s+/).length;
    else if (block.kind === "figure" && block.caption) {
      n += block.caption.split(/\s+/).length;
    }
  }
  return n;
}

/** Stringify schema for inclusion in a <script type="application/ld+json"> tag. */
export function renderJsonLd(schema: Json | Json[]): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
