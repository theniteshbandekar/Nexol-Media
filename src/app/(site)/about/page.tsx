import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { RouteHidden } from "@/components/route-hidden";
import { getSiteSettings } from "@/lib/sanity/site-settings";

export const metadata: Metadata = {
  title: "About — How Nexol Media Works",
  description:
    "How Nexol Media works and what we believe. Strategy first, then craft. Small team, senior people. Ship to learn — a Mumbai media studio serving Tech, AI and Design creators worldwide.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    title: "About — Nexol Media",
    description:
      "A Mumbai media studio for Tech, AI and Design creators. Strategy first, then craft.",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Nexol Media",
    description: "A Mumbai media studio for Tech, AI and Design creators.",
  },
};

const principles = [
  {
    title: "Strategy first, then craft",
    body: "Beautiful work that doesn't ladder up to a business outcome is decoration. We start with the problem.",
  },
  {
    title: "Small team, senior people",
    body: "You work with the people doing the work. No layers of account management between you and the craft.",
  },
  {
    title: "Ship to learn",
    body: "We move in short cycles, measure honestly, and double down on what's working.",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  if (settings.routeVisibility.about === false) {
    return <RouteHidden label="About" />;
  }
  return (
    <>
      <section className="container-x section-y">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            About
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-4 max-w-4xl text-balance font-heading text-fluid-5xl font-semibold">
            A media studio built for the work, not the org chart.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-fluid-lg text-muted-foreground">
            Nexol Media is an independent agency. We partner with founders,
            marketing leaders and product teams who care as much about the
            details as we do.
          </p>
        </Reveal>
      </section>

      <section className="container-x pb-24">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal
              key={p.title}
              as="li"
              delay={i * 0.06}
              className="bg-background p-6 md:p-8"
            >
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                0{i + 1}
              </div>
              <h2 className="mt-4 font-heading text-fluid-xl font-semibold">
                {p.title}
              </h2>
              <p className="mt-2 text-fluid-sm text-muted-foreground">
                {p.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
