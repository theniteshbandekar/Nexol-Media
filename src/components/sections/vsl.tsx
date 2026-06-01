import type { HomeVsl } from "@/lib/sanity/home-page";

export function VslSection({ vsl }: { vsl: HomeVsl }) {
  const videoUrl = vsl.videoUrl;
  const label = `Play sales letter video${vsl.title ? `: ${vsl.title}` : ""}`;

  const inner = (
    <>
      <div className="vsl-poster" />

      {videoUrl && (
        <div className="vsl-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      <div className="vsl-meta">
        <span className="title">{vsl.title ?? ""}</span>
        {vsl.duration && <span className="dur">{vsl.duration}</span>}
      </div>
    </>
  );

  return (
    <section className="vsl" id="vsl" aria-label="Video sales letter">
      {videoUrl ? (
        // Real anchor: keyboard + screen-reader accessible and actually opens the
        // video. (Was a div[role=button] with no click/keydown handler — a dead
        // affordance for every user.)
        <a
          className="vsl-player"
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
        >
          {inner}
        </a>
      ) : (
        // No video configured yet — render the poster without any clickable
        // affordance so we don't promise an interaction that does nothing.
        <div className="vsl-player vsl-player-empty">{inner}</div>
      )}
    </section>
  );
}
