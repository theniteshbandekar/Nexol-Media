import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getAllCaseStudies, type CaseStudy } from "@/lib/case-studies";
import { JsonLd } from "@/components/json-ld";
import { RouteHidden } from "@/components/route-hidden";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import { getCaseStudiesIndex } from "@/lib/sanity/index-pages";
import { itemListSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Case Studies — Real Creator Growth Stories",
  description:
    "Real stories from creators we partner with at Nexol Media. Strategy, editing, distribution, and the growth that compounds. Includes the Adrien Ninet 12k → 412k subscriber case.",
  alternates: { canonical: "/case-studies" },
  openGraph: {
    type: "website",
    url: "/case-studies",
    title: "Case Studies — Nexol Media",
    description:
      "Real creator growth stories from Nexol Media. Strategy, editing, distribution.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Studies — Nexol Media",
    description: "Real creator growth stories from Nexol Media.",
  },
};

function CaseArrow() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7h8" />
      <path d="m8 4 3 3-3 3" />
    </svg>
  );
}

function CardMedia({ study }: { study: CaseStudy }) {
  if (study.cardImage) {
    return (
      <Image
        src={study.cardImage.src}
        alt={study.cardImage.alt}
        fill
        sizes="(max-width: 760px) 100vw, 440px"
        priority={false}
        style={{ objectFit: "cover" }}
      />
    );
  }
  return <span className="poster" aria-hidden />;
}

function CaseCard({ study, delay }: { study: CaseStudy; delay: number }) {
  const inner = (
    <>
      <CardMedia study={study} />
      {study.comingSoon && <span className="case-soon-badge">Coming soon</span>}
      <div className="case-name">
        <span>{study.name}</span>
        <span className="case-arrow" aria-hidden="true">
          <CaseArrow />
        </span>
      </div>
    </>
  );

  const className = `case-card fade-up d${delay}${study.comingSoon ? " is-soon" : ""}`;

  if (study.comingSoon) {
    return (
      <div
        className={className}
        aria-label={`${study.name} — case study coming soon`}
        role="img"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      className={className}
      href={`/case-studies/${study.slug}`}
      aria-label={`Read the ${study.name} case study`}
    >
      {inner}
    </Link>
  );
}

export default async function CaseStudiesPage() {
  const settings = await getSiteSettings();
  if (settings.routeVisibility.caseStudies === false) {
    return <RouteHidden label="Case studies" />;
  }

  const caseStudies = await getAllCaseStudies();
  const idx = await getCaseStudiesIndex();
  const publishedStudies = caseStudies.filter(
    (c) => !c.comingSoon && c.rows && c.rows.length > 0
  );
  const listSchema = itemListSchema(
    "Nexol Media · Case Studies",
    publishedStudies.map((c) => ({
      url: `/case-studies/${c.slug}`,
      name: c.name,
    }))
  );

  return (
    <>
      <JsonLd schema={listSchema} />
      <header className="page-header">
        <h1 className="fade-up d1">
          {idx.heading.before}
          <span className="accent">{idx.heading.accent}</span>
          {idx.heading.after}
        </h1>
      </header>

      <section className="cases" aria-label="Case studies grid">
        <div className="cases-grid">
          {caseStudies.map((study, i) => (
            <CaseCard
              key={study.slug}
              study={study}
              delay={Math.min(i + 2, 5)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
