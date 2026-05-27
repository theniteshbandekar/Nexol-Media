import type { HomeHero } from "@/lib/sanity/home-page";

export function HeroSection({ hero }: { hero: HomeHero }) {
  const { h1, tagline, scrollCue } = hero;
  return (
    <section className="hero" aria-label="Hero">
      <h1 className="fade-up d2">
        {h1.before}
        {h1.accent && (
          <>
            <br />
            <span className="accent">{h1.accent}</span>
          </>
        )}
        {h1.after}
      </h1>

      {tagline && (
        <p className="one-liner fade-up d3">{tagline}</p>
      )}

      {scrollCue && (
        <span className="scroll-cue" aria-hidden="true">
          {scrollCue}
        </span>
      )}
    </section>
  );
}
