import type { HomeVsl } from "@/lib/sanity/home-page";

export function VslSection({ vsl }: { vsl: HomeVsl }) {
  return (
    <section className="vsl" id="vsl" aria-label="Video sales letter">
      <div
        className="vsl-player"
        role="button"
        aria-label="Play sales letter video"
        tabIndex={0}
      >
        <div className="vsl-poster" />

        <div className="vsl-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        <div className="vsl-meta">
          <span className="title">{vsl.title ?? ""}</span>
          {vsl.duration && <span className="dur">{vsl.duration}</span>}
        </div>
      </div>
    </section>
  );
}
