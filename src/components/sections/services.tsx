import Link from "next/link";

import {
  ExploreArrow,
  InstagramGlyph,
  PlayTriangle,
  YouTubeGlyph,
} from "./_icons";

type Platform = "instagram" | "youtube";

type MediaMeta = {
  title: string;
  meta: string;
  platform: Platform;
};

type ServiceRowData = {
  num: string;
  title: string;
  description: string;
  variant: "reel" | "horizontal";
  media: MediaMeta;
  href: string;
};

const services: ServiceRowData[] = [
  {
    num: "01",
    title: "Personal Brand",
    description:
      "Deep-research, scripting, and editing for creators who want to be known — not just seen. Built around your voice, tuned for retention.",
    variant: "reel",
    media: { title: "@nexolmedia reel", meta: "340K", platform: "instagram" },
    href: "/services/personal-brand",
  },
  {
    num: "02",
    title: "Post Production & Editing",
    description:
      "Motion graphics, captions, sound design, color, and cut-to-the-beat edits. Every frame earns its place.",
    variant: "horizontal",
    media: { title: "Gordon Ly · channel cut", meta: "987K", platform: "youtube" },
    href: "/services/post-production",
  },
  {
    num: "03",
    title: "Podcast Distribution",
    description:
      "From raw recording to clipped, captioned, multi-platform release. We turn one episode into a week of content.",
    variant: "horizontal",
    media: { title: "Mr. Pynk · podcast cut", meta: "42:18", platform: "youtube" },
    href: "/services/podcast-distribution",
  },
  {
    num: "04",
    title: "Launch Videos",
    description:
      "Product launches, fundraising announcements, and founder stories — packaged for the algorithm and built to be quoted.",
    variant: "horizontal",
    media: { title: "Adrien Ninet · launch", meta: "3.1M", platform: "youtube" },
    href: "/services/launch-videos",
  },
  {
    num: "05",
    title: "Clipping",
    description:
      "High-velocity vertical clips from your long-form. Captions, hooks, and re-packs designed for Reels, Shorts, and TikTok.",
    variant: "reel",
    media: { title: "Leo De Matos · clip", meta: "800K", platform: "instagram" },
    href: "/services/clipping",
  },
];

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className="media-badge">
      {platform === "instagram" ? (
        <>
          <InstagramGlyph />
          Instagram
        </>
      ) : (
        <>
          <YouTubeGlyph />
          YouTube
        </>
      )}
    </span>
  );
}

function MediaSlot({
  vertical,
  media,
}: {
  vertical?: boolean;
  media: MediaMeta;
}) {
  return (
    <a
      className={`media-slot${vertical ? " vertical" : ""}${vertical ? " front" : ""}`}
      href="#"
      aria-label={`Watch ${media.title}`}
    >
      <span className="poster" aria-hidden />
      <PlatformBadge platform={media.platform} />
      <span className="media-play" aria-hidden="true">
        <PlayTriangle />
      </span>
      <div className="media-meta">
        <span className="t">{media.title}</span>
        <span className="v">{media.meta}</span>
      </div>
    </a>
  );
}

function ReelStack({ media }: { media: MediaMeta }) {
  return (
    <div className="reel-stack">
      <div className="back-left">
        <div className="poster absolute inset-0" />
      </div>
      <div className="back-right">
        <div className="poster absolute inset-0" />
      </div>
      <MediaSlot vertical media={media} />
    </div>
  );
}

function ServiceRow({ data }: { data: ServiceRowData }) {
  return (
    <article className="service-row">
      <div className="service-text">
        <div className="service-num">{data.num}</div>
        <h3 className="service-title">
          {data.title}
          <span className="title-dot">.</span>
        </h3>
        <p className="service-desc">{data.description}</p>
        <Link className="service-explore" href={data.href}>
          Explore
          <ExploreArrow />
        </Link>
      </div>
      <div className="service-media">
        {data.variant === "reel" ? (
          <ReelStack media={data.media} />
        ) : (
          <MediaSlot media={data.media} />
        )}
      </div>
    </article>
  );
}

export function ServicesSection() {
  return (
    <section className="services" id="services" aria-label="What we do">
      <div className="container">
        <header className="section-head">
          <div className="section-eyebrow">(03) — Services</div>
          <h2 className="section-title">What we do.</h2>
          <div className="line" />
        </header>

        {services.map((s) => (
          <ServiceRow key={s.num} data={s} />
        ))}
      </div>
    </section>
  );
}
