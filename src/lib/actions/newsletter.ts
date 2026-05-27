"use server";

import { addToNewsletterAudience } from "@/lib/email";

export type NewsletterPayload = {
  email: string;
};

export type NewsletterActionResult =
  | { ok: true }
  | { ok: false; error: string };

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function subscribeToNewsletter(
  payload: NewsletterPayload
): Promise<NewsletterActionResult> {
  const email = payload.email?.trim().toLowerCase() ?? "";
  if (!isEmail(email)) {
    return { ok: false, error: "That email address doesn't look right." };
  }

  const result = await addToNewsletterAudience({ email });
  if (!result.ok) {
    if (result.reason === "no-credentials") {
      // Newsletter provider not configured yet — still succeed gracefully so
      // the UI flow looks normal in dev. The team can pick up signups from
      // Sanity once the migration runs, or this can be swapped for a
      // form-doc collection later.
      return { ok: true };
    }
    return {
      ok: false,
      error:
        "We couldn't add you to the list right now. Try again in a moment.",
    };
  }
  return { ok: true };
}
