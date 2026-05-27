"use client";

import { useState, useTransition } from "react";

import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterCta() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="newsletter" aria-label="Newsletter signup">
      <span className="eyebrow">Subscribe</span>
      <h2>One honest essay on growth. Every Sunday.</h2>
      <p className="lede">
        No spam, no recycled threads. We send one essay a week with the patterns
        we are testing across the channels we run.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isPending || submitted) return;
          setError(null);
          const formEl = e.currentTarget;
          const data = new FormData(formEl);
          const email = String(data.get("email") ?? "");
          startTransition(async () => {
            const result = await subscribeToNewsletter({ email });
            if (result.ok) {
              setSubmitted(true);
              formEl.reset();
              window.setTimeout(() => setSubmitted(false), 6000);
            } else {
              setError(result.error);
            }
          });
        }}
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@channel.com"
          aria-label="Email address"
          disabled={submitted || isPending}
        />
        <button type="submit" disabled={submitted || isPending}>
          {submitted ? "On the list ✓" : isPending ? "Adding…" : "Subscribe"}
        </button>
      </form>
      {error && (
        <p
          className="fine"
          role="alert"
          style={{ color: "#FCA5A5", marginTop: 10 }}
        >
          {error}
        </p>
      )}
      <p className="fine">
        2,400+ creators · No spam · Unsubscribe with one click
      </p>
    </section>
  );
}
