import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress =
  process.env.RESEND_FROM_ADDRESS ?? "Nexol Media <noreply@nexolmedia.com>";
const replyTo = process.env.RESEND_REPLY_TO ?? "info@nexolmedia.com";
const inboxAddress = process.env.RESEND_TO_ADDRESS ?? "info@nexolmedia.com";

let cached: Resend | null = null;

function getClient(): Resend | null {
  if (!apiKey) return null;
  if (cached) return cached;
  cached = new Resend(apiKey);
  return cached;
}

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "no-credentials" | "send-failed"; error?: string };

export async function sendTransactionalEmail(args: {
  subject: string;
  html: string;
  text: string;
  to?: string;
  replyToOverride?: string;
}): Promise<SendResult> {
  const client = getClient();
  if (!client) return { ok: false, reason: "no-credentials" };

  try {
    const { data, error } = await client.emails.send({
      from: fromAddress,
      to: args.to ?? inboxAddress,
      replyTo: args.replyToOverride ?? replyTo,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (error) {
      return { ok: false, reason: "send-failed", error: error.message };
    }
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      reason: "send-failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Adds a contact to the Resend Audience (newsletter list) if both the
 * API key and audience ID are configured. Returns ok=true when the
 * subscriber is added or already exists.
 */
export async function addToNewsletterAudience(args: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<SendResult> {
  const client = getClient();
  if (!client) return { ok: false, reason: "no-credentials" };
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) return { ok: false, reason: "no-credentials" };

  try {
    const { data, error } = await client.contacts.create({
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      audienceId,
      unsubscribed: false,
    });
    if (error) {
      // Resend's "already exists" comes back as a 409-style error — treat as success.
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("exists")) {
        return { ok: true, id: "" };
      }
      return { ok: false, reason: "send-failed", error: error.message };
    }
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      reason: "send-failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
