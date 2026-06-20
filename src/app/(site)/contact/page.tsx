import type { Metadata } from "next";

import { ContactBookingCard } from "@/components/contact-booking-card";
import { QuotationRequestCard } from "@/components/quotation-request-card";
import { JsonLd } from "@/components/json-ld";
import { RouteHidden } from "@/components/route-hidden";
import {
  type AvailableSlot,
  getAvailableSlots,
} from "@/lib/actions/booking";
import {
  BOOKING_WEEKDAYS,
  BOOKING_WINDOW_DAYS,
  isoWeekday,
  toBookingDateISO,
} from "@/lib/booking-constants";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import { faqSchema } from "@/lib/schema";

import "./contact.css";

// Re-render per request so the calendar always reflects "now".
export const dynamic = "force-dynamic";

function firstWeekdayInWindow(): string | null {
  const start = new Date();
  for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = toBookingDateISO(d);
    if (BOOKING_WEEKDAYS.has(isoWeekday(iso))) return iso;
  }
  return null;
}

export const metadata: Metadata = {
  title: "Contact — Book a Call",
  description:
    "Book a 30-minute intro call with Nexol Media. Pick a slot and a Google Calendar invite with a Meet link lands in your inbox in seconds.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: "Contact — Nexol Media",
    description:
      "Book a 30-minute intro call with Nexol Media. Calendar invite with a Meet link in seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Nexol Media",
    description: "Book a 30-minute intro call with Nexol Media.",
  },
};

const faqs: { q: string; a: string; open?: boolean }[] = [
  {
    q: "What happens after I book a call?",
    a: "You get a Google Calendar invite with a Meet link straight away — both you and we will see it on our calendars. Before the call we look at your channel so we come prepared. On the call we talk goals, look at recent uploads together, and share how we'd approach the work. No slides, no pitch deck.",
    open: true,
  },
  {
    q: "Do you take on creators under 10k subscribers?",
    a: "Sometimes. We look at the channel, not the count — pace of growth, niche, how serious you are about the next 12 months. Some of our best clients started here under 5k.",
  },
  {
    q: "What does a typical engagement look like?",
    a: "A 60-day window. We learn the channel for two weeks, ship the first batch in week three, then iterate every Friday on what is working and what is not. After 60 days we either renew, evolve the scope, or part ways cleanly.",
  },
  {
    q: "How is pricing structured?",
    a: "Monthly retainer, scoped to volume and complexity. We share a clear range on the intro call once we have seen one or two of your recent uploads. No long-term contracts.",
  },
  {
    q: "Can we just hire you for one launch video?",
    a: "Yes. Launch videos are a fixed-scope project, billed flat. We do the script pass, the edit, two rounds of revision, and the thumbnail. Timeline is two to three weeks from kickoff.",
  },
];

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  if (settings.routeVisibility.contact === false) {
    return <RouteHidden label="Contact" />;
  }

  const initialDate = firstWeekdayInWindow();
  let initialSlots: AvailableSlot[] = [];
  let initialConfigured = true;
  if (initialDate) {
    const res = await getAvailableSlots(initialDate);
    if (res.ok) {
      initialSlots = res.slots;
      initialConfigured = res.configured;
    }
  }

  return (
    <div className="contact-page">
      <JsonLd schema={faqSchema(faqs)} />

      <section className="ct-main ct-main-top" aria-label="Contact options">
        {/* Mobile-only jump links — hidden on desktop via CSS */}
        <div className="ct-mobile-nav" aria-label="Jump to section">
          <a href="#book" className="ct-mobile-nav-btn ct-mobile-nav-btn--primary">
            Book a Call
          </a>
          <a href="#quotation" className="ct-mobile-nav-btn">
            Request a Quotation
          </a>
        </div>
        <div className="ct-grid">
          <ContactBookingCard
            initialDate={initialDate}
            initialSlots={initialSlots}
            initialConfigured={initialConfigured}
          />
          <QuotationRequestCard />
        </div>
      </section>

      <section className="ct-strip" aria-label="Other ways to reach us">
        <div className="ct-strip-inner">
          <h2>Or reach us directly</h2>
          <div className="ct-strip-grid">
            <a className="info-card" href="mailto:info@nexolmedia.com">
              <span className="k">Email</span>
              <span className="v">info@nexolmedia.com</span>
              <span className="sub">Replies in ~24 hours, Mon–Fri</span>
            </a>
            <a className="info-card" href="tel:+917058025578">
              <span className="k">Phone</span>
              <span className="v">+91 705 802 5578</span>
              <span className="sub">10:00 – 19:00 IST</span>
            </a>
            <a
              className="info-card"
              href="https://www.instagram.com/nexolmedia"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="k">Social</span>
              <span className="v">@nexolmedia ↗</span>
              <span className="sub">Instagram · X / Twitter</span>
            </a>
            <div className="info-card">
              <span className="k">Studio</span>
              <span className="v">Mumbai · Worldwide</span>
              <span className="sub">Working with creators in 14 countries</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-faq" aria-label="Frequently asked questions">
        <div className="ct-faq-inner">
          <h2>Common questions.</h2>
          <div className="faq-list">
            {faqs.map((f) => (
              <details key={f.q} className="faq-item" open={f.open}>
                <summary>
                  {f.q}
                  <span className="icn" aria-hidden="true">
                    <PlusIcon />
                  </span>
                </summary>
                <div className="ans">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
