"use server";

import { addToNewsletterAudience } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type NewsletterPayload = {
  email: string;
};

export type NewsletterActionResult =
  | { ok: true }
  | { ok: false; error: string };

function isEmail(v: string): boolean {
  // Require a 2+ char TLD; stays permissive enough not to reject valid addresses.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export async function subscribeToNewsletter(
  payload: NewsletterPayload
): Promise<NewsletterActionResult> {
  const email = payload.email?.trim().toLowerCase() ?? "";
  if (!isEmail(email)) {
    return { ok: false, error: "That email address doesn't look right." };
  }

  const ip = await clientIp();
  if (!rateLimit(`newsletter:${ip}`, 5, 60 * 60 * 1000).ok) {
    return { ok: false, error: "Too many signups from here. Please try again later." };
  }

  const result = await addToNewsletterAudience({ email });
  if (!result.ok) {
    if (result.reason === "no-credentials") {
      // Newsletter provider not configured yet — still return success so the UI
      // flow looks normal, but log it so a misconfigured Resend in production is
      // detectable instead of silently dropping signups.
      console.warn(
        `[newsletter] RESEND not configured — signup accepted in UI but NOT persisted: ${email}`,
      );
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
