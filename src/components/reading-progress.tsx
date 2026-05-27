"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frame = 0;
    let ticking = false;

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.width = `${pct * 100}%`;
      ticking = false;
    };

    if (prefersReducedMotion) {
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", update);
      update();
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", update);
      };
    }

    const loop = () => {
      update();
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div ref={barRef} className="bar" />
    </div>
  );
}
