import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllServices, getService, type Service } from "@/lib/services";
import { JsonLd } from "@/components/json-ld";
import { RouteHidden } from "@/components/route-hidden";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import {
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/lib/schema";

import "../services.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((s) => ({ slug: s.slug }));
}

/** Per-service title and description optimized for the SERP. */
function metadataFor(service: Service): { title: string; description: string } {
  switch (service.slug) {
    case "clipping":
      return {
        title:
          "Clipping — Daily Vertical Clips for Creators · TikTok, Reels, Shorts",
        description:
          "Nexol Media's clipping service pulls 3–5 vertical clips per day from your long-form uploads and posts them natively to TikTok, Reels, and Shorts. Built for retention. Captioned per platform.",
      };
    case "personal-brand":
      return {
        title:
          "Personal Brand for Creators — Strategy, Direction, Visual System",
        description:
          "Channel positioning, visual system, and on-camera direction for Tech, AI and Design creators. We turn experts into characters audiences recognize in the first second.",
      };
    case "post-production":
      return {
        title:
          "YouTube Post Production — Editing, Color, Sound, Thumbnails",
        description:
          "Full-service editing for long-form YouTube. Hook-first cuts on our 4-question framework, color and sound, motion graphics, and three thumbnail variants per video.",
      };
    case "podcast-distribution":
      return {
        title:
          "Podcast Distribution — YouTube, Verticals, Newsletter, Transcript",
        description:
          "One conversation, ten distribution surfaces. YouTube upload, 6–10 vertical clips, newsletter blurb, and searchable transcript — all from a single podcast record.",
      };
    case "launch-videos":
      return {
        title:
          "Launch Videos — Product, Fundraise, Category Announcements",
        description:
          "Polished feature videos for product launches, fundraises, and category announcements. Six-beat script structure. Fixed scope, 2–3 weeks, master plus vertical cutdown.",
      };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found", robots: { index: false } };

  const { title, description } = metadataFor(service);
  const canonical = `/services/${service.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function ArrowOut() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10 10 4" />
      <path d="M5 4h5v5" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 7H3" />
      <path d="m6 4-3 3 3 3" />
    </svg>
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  if (settings.routeVisibility.services === false) {
    return <RouteHidden label="Services" />;
  }
  const [service, allServices] = await Promise.all([
    getService(slug),
    getAllServices(),
  ]);
  if (!service) notFound();

  const others = allServices.filter((s) => s.slug !== service.slug);
  const totalCount = allServices.length.toString().padStart(2, "0");

  const schemas: Record<string, unknown>[] = [
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
      { name: service.title, url: `/services/${service.slug}` },
    ]),
    serviceSchema(service),
  ];
  if (service.faqs && service.faqs.length > 0) {
    schemas.push(faqSchema(service.faqs));
  }

  return (
    <div className="services-page">
      <JsonLd schema={schemas} />
      <header className="service-detail-head">
        <Link className="back fade-up" href="/services">
          <ArrowLeft />
          All services
        </Link>
        <p className="service-counter fade-up d1">
          Service · {service.num} of {totalCount}
        </p>
        <h1 className="fade-up d2">
          {service.title}
          <span className="accent-dot">.</span>
        </h1>
        <p className="tagline fade-up d3">{service.tagline}</p>
        <div className="actions fade-up d4">
          <Link className="btn-primary" href="/contact">
            Send a brief
            <ArrowOut />
          </Link>
          <Link
            href="/contact#book"
            className="tag-pill"
            style={{ height: 44, padding: "0 18px", fontSize: 13 }}
          >
            Book a call
          </Link>
        </div>
      </header>

      <section className="svc-section" aria-label="What you get">
        <div className="head">
          <h2>What you get.</h2>
          <span className="meta">{service.deliverablesMeta}</span>
        </div>
        <div className="deliverables-grid">
          {service.deliverables.map((d, i) => (
            <article key={d.title} className="deliverable-card">
              <span className="num">({String(i + 1).padStart(2, "0")})</span>
              <h3>{d.title}</h3>
              <p className="desc">{d.description}</p>
              <ul>
                {d.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="svc-section" aria-label="Recent work">
        <div className="head">
          <h2>{service.workHeading}</h2>
          <span className="meta">{service.workMeta}</span>
        </div>
        <div className="work-gallery">
          {service.workSamples.map((w, i) => {
            const inner = (
              <>
                {i === 0 && <span className="accent-pulse" aria-hidden="true" />}
                <span className="label">{w.label}</span>
              </>
            );
            if (w.caseStudySlug) {
              return (
                <Link
                  key={`${w.label}-${i}`}
                  className="work-card"
                  href={`/case-studies/${w.caseStudySlug}`}
                  aria-label={`${w.label} — open related case study`}
                >
                  {inner}
                </Link>
              );
            }
            return (
              <div
                key={`${w.label}-${i}`}
                className="work-card"
                role="img"
                aria-label={w.label}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      <section className="svc-section" aria-label="Numbers we have moved">
        <div className="head">
          <h2>Numbers we have moved.</h2>
          <span className="meta">{service.metricsMeta}</span>
        </div>
        <div className="metrics-grid">
          {service.metrics.map((m) => (
            <article key={m.label} className="metric-card">
              <span className="num">{m.num}</span>
              <span className="label">{m.label}</span>
              {m.context && <p className="context">{m.context}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="process-section" aria-label="How an engagement runs">
        <div className="head">
          <h2>How an engagement runs.</h2>
          <span className="meta">{service.processMeta}</span>
        </div>
        <div className="process-grid">
          {service.process.map((p) => (
            <article key={p.num} className="process-step">
              <span className="num">({p.num})</span>
              <span className="week">{p.week}</span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </article>
          ))}
        </div>
      </section>

      {service.faqs && service.faqs.length > 0 && (
        <section className="svc-section svc-faq" aria-label="Frequently asked questions">
          <div className="head">
            <h2>Common questions.</h2>
            <span className="meta">{service.title} · FAQ</span>
          </div>
          <div className="svc-faq-list">
            {service.faqs.map((f, i) => (
              <details key={f.q} className="svc-faq-item" open={i === 0}>
                <summary>
                  {f.q}
                  <span className="svc-faq-icn" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <div className="svc-faq-ans">{f.a}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="svc-section" aria-label="Other services">
        <div className="head">
          <h2>Other services.</h2>
          <span className="meta">Four more · pick what fits</span>
        </div>
        <div className="other-services-grid">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/services/${o.slug}`}
              className="other-service-card"
            >
              <span className="num">({o.num})</span>
              <h3>
                {o.title}
                <span className="accent-dot">.</span>
              </h3>
              <p>{o.description}</p>
              <span className="more">View service →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-banner" aria-label="Get started">
        <h2>{service.ctaHeading}</h2>
        <p>
          Send a brief or book a 30-minute call. A real person on our team
          replies within one working day.
        </p>
        <div className="actions">
          <Link className="btn-primary btn-primary-lg" href="/contact">
            Send a brief
            <ArrowOut />
          </Link>
          <Link className="ghost" href="/contact#book">
            Book a call
          </Link>
        </div>
      </section>
    </div>
  );
}
