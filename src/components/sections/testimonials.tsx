import Link from "next/link";

import type { HomeTestimonialCard } from "@/lib/sanity/home-page";

import {
  InstagramGlyph,
  PlayTriangle,
  Star,
  YouTubeGlyph,
} from "./_icons";

function Stars() {
  return (
    <div className="stars" aria-label="5 of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} />
      ))}
    </div>
  );
}

function AvatarPlaceholder() {
  return (
    <span
      className="avatar"
      aria-hidden
      style={{
        background:
          "linear-gradient(135deg, var(--gray-300), var(--gray-500))",
      }}
    />
  );
}

export function TestimonialsSection({
  cards,
}: {
  cards: HomeTestimonialCard[];
}) {
  return (
    <section
      className="testimonials"
      id="testimonials"
      aria-label="Testimonials"
    >
      <div className="container">
        <header className="section-head">
          <div className="section-eyebrow">(05) — Testimonials</div>
          <h2 className="section-title">
            What creators say<span className="title-dot">.</span>
          </h2>
          <div className="line" />
        </header>

        <div className="bento">
          {cards.map((card, i) => {
            const spanClass = `bento-${card.span}`;
            if (card.type === "video") {
              const Icon =
                card.platform === "instagram" ? InstagramGlyph : YouTubeGlyph;
              const inner = (
                <>
                  <span className="poster" aria-hidden />
                  <span className="badge">
                    <Icon />
                    {card.badgeLabel}
                  </span>
                  <span className="play" aria-hidden="true">
                    <PlayTriangle />
                  </span>
                  <div className="meta">
                    <div className="meta-name">{card.name}</div>
                    <div className="meta-role">{card.role}</div>
                  </div>
                </>
              );
              if (card.href) {
                return (
                  <Link
                    key={i}
                    className={`bento-card bento-video ${spanClass}`}
                    href={card.href}
                    aria-label={`Read the ${card.name} case study`}
                  >
                    {inner}
                  </Link>
                );
              }
              return (
                <a
                  key={i}
                  className={`bento-card bento-video ${spanClass}`}
                  href="#"
                  aria-label={`Watch ${card.name}'s testimonial`}
                >
                  {inner}
                </a>
              );
            }
            const quoteWithClippingLink =
              card.quote.includes("Clipping") ? (
                <p className="quote">
                  {card.quote.split("Clipping").map((chunk, idx, arr) => (
                    <span key={idx}>
                      {chunk}
                      {idx < arr.length - 1 && (
                        <Link
                          href="/services/clipping"
                          style={{ borderBottom: "1px solid currentColor" }}
                        >
                          Clipping
                        </Link>
                      )}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="quote">{card.quote}</p>
              );
            return (
              <article
                key={i}
                className={`bento-card bento-text ${spanClass}${card.featured ? " featured" : ""}`}
              >
                <Stars />
                {quoteWithClippingLink}
                <div className="author">
                  <AvatarPlaceholder />
                  <div>
                    <div className="author-name">{card.name}</div>
                    <div className="author-role">{card.role}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
