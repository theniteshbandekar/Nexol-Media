import type { Metadata } from "next";
import Link from "next/link";

import { getAllServices } from "@/lib/services";
import { JsonLd } from "@/components/json-ld";
import { RouteHidden } from "@/components/route-hidden";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import { getServicesIndex } from "@/lib/sanity/index-pages";
import { itemListSchema } from "@/lib/schema";

import "./services.css";

export const metadata: Metadata = {
  title: "Services — Five Services for Tech, AI and Design Creators",
  description:
    "Personal brand, post production, podcast distribution, launch videos, and clipping. Five services for Tech, AI and Design creators — each tuned to move a single number you care about.",
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    url: "/services",
    title: "Services — Nexol Media",
    description:
      "Five services for Tech, AI and Design creators: personal brand, post production, podcast distribution, launch videos, and clipping.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services — Nexol Media",
    description:
      "Personal brand, post production, podcast distribution, launch videos, clipping.",
  },
};

function ArrowDiag() {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13 13 5" />
      <path d="M6 5h7v7" />
    </svg>
  );
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

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  if (settings.routeVisibility.services === false) {
    return <RouteHidden label="Services" />;
  }

  const services = await getAllServices();
  const idx = await getServicesIndex();
  const listSchema = itemListSchema(
    "Nexol Media · Services",
    services.map((s) => ({
      url: `/services/${s.slug}`,
      name: s.title,
    }))
  );

  return (
    <div className="services-page">
      <JsonLd schema={listSchema} />
      <header className="services-head">
        <p className="eyebrow fade-up">{idx.eyebrow}</p>
        <h1 className="fade-up d1">
          {idx.title}
          <span className="accent-dot">.</span>
        </h1>
        <p className="dek fade-up d2">{idx.dek}</p>
        <div className="actions fade-up d3">
          <Link className="btn-primary" href="/contact">
            Send a brief
            <ArrowOut />
          </Link>
          <Link
            href="/case-studies"
            className="tag-pill"
            style={{ height: 44, padding: "0 18px", fontSize: 13 }}
          >
            See the work
          </Link>
        </div>
      </header>

      <section className="service-rows" aria-label="Services">
        {services.map((s, i) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className={`service-row fade-up d${Math.min(i + 1, 5)}`}
            aria-label={`${s.title} — view service`}
          >
            <span className="num">({s.num})</span>
            <div className="body">
              <h2 className="title">
                {s.title}
                <span className="accent-dot">.</span>
              </h2>
              <div className="pills">
                {s.pills.map((p) => (
                  <span key={p} className="tag-pill">
                    {p}
                  </span>
                ))}
              </div>
              <p className="desc">{s.description}</p>
            </div>
            <span className="arrow" aria-hidden="true">
              <ArrowDiag />
            </span>
          </Link>
        ))}
      </section>

      <section className="process-section" aria-label="How an engagement runs">
        <div className="head">
          <h2>{idx.processHeading}</h2>
          <span className="meta">{idx.processMeta}</span>
        </div>
        <div className="process-grid">
          {idx.processSteps.map((step) => (
            <div className="process-step" key={step.num}>
              <span className="num">{step.num}</span>
              <span className="week">{step.week}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="trust-stats" aria-label="Trust signals">
        {idx.trustStats.map((stat) => (
          <div key={stat.label}>
            <span className="num">{stat.num}</span>
            <span className="label">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="cta-banner" aria-label="Get started">
        <h2>{idx.ctaHeading}</h2>
        <p>{idx.ctaBody}</p>
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
