import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllCaseStudies,
  getCaseStudy,
  type AccentHeading,
  type CaseStudyRow,
  type StoryBody,
  type StoryPhoto,
} from "@/lib/case-studies";
import { JsonLd } from "@/components/json-ld";
import { RouteHidden } from "@/components/route-hidden";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import {
  breadcrumbSchema,
  caseStudyArticleSchema,
  personSchema,
} from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const all = await getAllCaseStudies();
  return all.map((c) => ({ slug: c.slug }));
}

function flatTitle(heading?: AccentHeading): string {
  if (!heading) return "";
  return [heading.before, heading.accent, heading.after]
    .filter(Boolean)
    .join("")
    .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return { title: "Case study not found", robots: { index: false } };

  const canonical = `/case-studies/${slug}`;
  const statLine = study.stats
    ? study.stats.map((s) => `${s.num} ${s.label.toLowerCase()}`).join(" · ")
    : "";
  const title = study.title
    ? `${study.name} — ${flatTitle(study.title)} · Nexol Media Case Study`
    : `${study.name} — ${study.role} · Nexol Media Case Study`;
  const description = study.description
    ? study.description
    : `${study.name} (${study.role}) — a Nexol Media case study${
        statLine ? `. ${statLine}.` : "."
      }`;

  if (study.comingSoon) {
    return {
      title: `${study.name} — Case study coming soon`,
      description: `${study.name} (${study.role}) — a Nexol Media case study in production.`,
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      publishedTime: study.publishedAt,
      authors: ["Nexol Media"],
      tags: ["case study", study.role, "creator growth", study.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function Accented({ heading }: { heading: AccentHeading }) {
  return (
    <>
      {heading.before}
      {heading.accent && <span className="accent">{heading.accent}</span>}
      {heading.after}
    </>
  );
}

function StoryParagraph({ body }: { body: StoryBody }) {
  return (
    <p className="story-p">
      {body.text}
      {body.bold && (
        <>
          {" "}
          <b>{body.bold}</b>
        </>
      )}
    </p>
  );
}

function StoryPhotoBlock({
  photo,
  priority,
}: {
  photo: StoryPhoto;
  priority?: boolean;
}) {
  if (photo.kind === "image") {
    return (
      <div className="story-photo">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 900px) 100vw, 540px"
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }
  return (
    <div className="story-photo placeholder">
      <span className="ph-label">{photo.label}</span>
    </div>
  );
}

function StoryRow({ row, index }: { row: CaseStudyRow; index: number }) {
  return (
    <article className={`row ${row.layout}`}>
      <div className="story-text">
        <p className="story-num">{row.num}</p>
        <h2 className="story-h">
          <Accented heading={row.heading} />
        </h2>
        <StoryParagraph body={row.body} />
      </div>
      <StoryPhotoBlock photo={row.photo} priority={index === 0} />
    </article>
  );
}

function BookArrow() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10 10 4" />
      <path d="M5 4h5v5" />
    </svg>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  if (settings.routeVisibility.caseStudies === false) {
    return <RouteHidden label="Case studies" />;
  }
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const isComingSoon = study.comingSoon === true;

  const schemas = isComingSoon
    ? []
    : [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Case Studies", url: "/case-studies" },
          { name: study.name, url: `/case-studies/${study.slug}` },
        ]),
        personSchema(study),
        caseStudyArticleSchema(study),
      ];

  return (
    <>
      {schemas.length > 0 && <JsonLd schema={schemas} />}
      <nav className="crumb fade-up" aria-label="Breadcrumb">
        <Link href="/case-studies">Case Studies</Link>
        <span className="sep">/</span>
        <span className="current">{study.name}</span>
      </nav>

      <header className="case-header">
        <p className="role fade-up d1">{study.role}</p>
        <h1 className="fade-up d2">
          {study.title ? (
            <Accented heading={study.title} />
          ) : (
            <>
              {study.name}
              <span className="accent"> story</span>
            </>
          )}
        </h1>

        {study.stats && study.stats.length > 0 && (
          <div className="case-stats fade-up d3">
            {study.stats.map((s) => (
              <div key={s.label}>
                <div className="s-num">{s.num}</div>
                <div className="s-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </header>

      <section className="story" aria-label={`${study.name} story`}>
        <div className="story-inner">
          {isComingSoon || !study.rows ? (
            <article className="row photo-right">
              <div className="story-text">
                <p className="story-num">00 · In production</p>
                <h2 className="story-h">
                  This case study is being{" "}
                  <span className="accent">written up</span>.
                </h2>
                <p className="story-p">
                  We're putting the finishing touches on this story. In the
                  meantime, hop back to the index to browse the others —
                  or book a quick call and we'll walk you through it live.
                </p>
              </div>
              <div className="story-photo placeholder">
                <span className="ph-label">
                  PHOTO · {study.name} — coming soon
                </span>
              </div>
            </article>
          ) : (
            study.rows.map((row, i) => (
              <StoryRow key={row.num} row={row} index={i} />
            ))
          )}
        </div>
      </section>

      <section className="next-cta" aria-label="Next steps">
        <div className="next-cta-inner">
          <h3>
            {study.ctaHook ??
              `Want a story like ${study.name.split(" ")[0]}'s? Let us pitch you one.`}
          </h3>
          <div className="actions">
            <Link className="btn-primary" href="/contact#book">
              Book a Call
              <BookArrow />
            </Link>
            <Link className="ghost" href="/case-studies">
              See more stories
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
