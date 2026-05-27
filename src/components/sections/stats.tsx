"use client";

import { useEffect, useRef } from "react";

import type { HomeStat } from "@/lib/sanity/home-page";

function formatNumber(n: number, useComma: boolean) {
  const rounded = Math.floor(n);
  return useComma ? rounded.toLocaleString("en-US") : String(rounded);
}

export function StatsSection({ stats }: { stats: HomeStat[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>(".stat")
    );
    if (!els.length) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const animate = (el: HTMLElement) => {
      const target = Number(el.dataset.target ?? 0);
      const suffix = el.dataset.suffix ?? "";
      const useComma = el.dataset.comma === "true";
      const valueEl = el.querySelector<HTMLElement>(".num-value");
      if (!valueEl) return;

      if (prefersReduced) {
        valueEl.textContent = formatNumber(target, useComma) + suffix;
        return;
      }

      const duration = 1800;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
        const v = target * eased;
        valueEl.textContent = formatNumber(v, useComma) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => {
        el.classList.add("in-view");
        animate(el);
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          animate(entry.target as HTMLElement);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      className="stats"
      id="stats"
      aria-label="Stats"
      ref={rootRef}
    >
      <div className="stats-inner">
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat"
            data-target={s.target}
            data-suffix={s.suffix ?? ""}
            data-comma={s.comma ? "true" : undefined}
          >
            <div className="stat-num">
              <span className="num-value">0</span>
              <span className="plus">+</span>
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
