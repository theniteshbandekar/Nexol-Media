"use server";

import {
  BOOKING_MIN_ADVANCE_HOURS,
  BOOKING_SLOT_MINUTES,
  BOOKING_TIMEZONE,
  BOOKING_WEEKDAYS,
  BOOKING_WINDOW_DAYS,
  isoWeekday,
  toBookingDateISO,
} from "@/lib/booking-constants";
import { sendTransactionalEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  buildDaySlots,
  getBusyRanges,
  hasGoogleCalendarCredentials,
  insertEvent,
  isSlotFree,
} from "@/lib/google-calendar";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export type AvailableSlot = { startISO: string; endISO: string };

export type SlotsResult =
  | { ok: true; slots: AvailableSlot[]; configured: boolean }
  | { ok: false; error: string };

export type BookingPayload = {
  startISO: string;
  endISO: string;
  name: string;
  email: string;
  services?: string[];
  message?: string;
};

export type BookingResult =
  | { ok: true; meetLink: string | null }
  | {
      ok: false;
      reason: "slot_taken" | "validation" | "calendar_unreachable";
      error: string;
    };

function isEmail(v: string): boolean {
  // Require a 2+ char TLD; stays permissive enough not to reject valid addresses.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function isWithinWindow(dateISO: string): boolean {
  const today = toBookingDateISO(new Date());
  if (dateISO < today) return false;
  const maxDate = new Date();
  maxDate.setUTCDate(maxDate.getUTCDate() + BOOKING_WINDOW_DAYS);
  return dateISO <= toBookingDateISO(maxDate);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Returns available 30-min slot starts for the given calendar day in the
 * booking timezone. Slots <2h from now or overlapping a busy range are dropped.
 *
 * `configured: false` means no Google credentials — UI will surface a helpful
 * message instead of pretending the day is empty.
 */
export async function getAvailableSlots(
  dateISO: string
): Promise<SlotsResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    return { ok: false, error: "Invalid date." };
  }
  if (!BOOKING_WEEKDAYS.has(isoWeekday(dateISO))) {
    return { ok: true, slots: [], configured: hasGoogleCalendarCredentials() };
  }
  if (!isWithinWindow(dateISO)) {
    return { ok: false, error: "Date is outside the booking window." };
  }

  if (!hasGoogleCalendarCredentials()) {
    // Show all candidate slots locally so the UI is testable without creds.
    const candidates = buildDaySlots(dateISO);
    return {
      ok: true,
      configured: false,
      slots: candidates.filter((s) => isAtLeastMinutesAhead(s.startISO)),
    };
  }

  let busy: { startMs: number; endMs: number }[];
  try {
    busy = await getBusyRanges(dateISO);
  } catch (err) {
    console.warn("[booking] freebusy query failed (likely invalid credentials):", (err as Error).message);
    return { ok: false, error: "Calendar is temporarily unreachable." };
  }

  const candidates = buildDaySlots(dateISO);
  const slots = candidates.filter((slot) => {
    if (!isAtLeastMinutesAhead(slot.startISO)) return false;
    const startMs = new Date(slot.startISO).getTime();
    const endMs = new Date(slot.endISO).getTime();
    return !busy.some((b) => b.startMs < endMs && b.endMs > startMs);
  });

  return { ok: true, slots, configured: true };
}

function isAtLeastMinutesAhead(startISO: string): boolean {
  const slotMs = new Date(startISO).getTime();
  const minMs = Date.now() + BOOKING_MIN_ADVANCE_HOURS * 60 * 60 * 1000;
  return slotMs >= minMs;
}

/**
 * Books the requested slot. Re-checks freebusy at submit time so two
 * visitors picking the same slot don't both succeed.
 */
export async function createBooking(
  payload: BookingPayload
): Promise<BookingResult> {
  if (!payload.name || payload.name.trim().length < 1) {
    return { ok: false, reason: "validation", error: "Please enter your name." };
  }
  if (payload.name.length > 80) {
    return { ok: false, reason: "validation", error: "Name is too long." };
  }
  if (!isEmail(payload.email)) {
    return { ok: false, reason: "validation", error: "That email looks off." };
  }
  if (payload.message && payload.message.length > 300) {
    return { ok: false, reason: "validation", error: "Message is too long." };
  }

  // The startISO must land on a half-hour boundary in the booking zone.
  if (
    !/^\d{4}-\d{2}-\d{2}T(\d{2}):(00|30):00\+\d{2}:\d{2}$/.test(payload.startISO)
  ) {
    return { ok: false, reason: "validation", error: "Invalid slot." };
  }
  if (!isAtLeastMinutesAhead(payload.startISO)) {
    return {
      ok: false,
      reason: "validation",
      error: "That slot is too close to now — pick something later.",
    };
  }

  const dateISO = payload.startISO.slice(0, 10);
  if (!isWithinWindow(dateISO) || !BOOKING_WEEKDAYS.has(isoWeekday(dateISO))) {
    return { ok: false, reason: "validation", error: "Slot is out of range." };
  }

  // Recompute endISO server-side rather than trusting the client.
  const expectedEnd = computeEndISO(payload.startISO);
  if (expectedEnd !== payload.endISO) {
    return { ok: false, reason: "validation", error: "Slot length mismatch." };
  }

  // Throttle before the expensive Google Calendar calls so a script can't spam
  // bogus calendar invites / confirmation emails.
  const ip = await clientIp();
  if (!rateLimit(`booking:${ip}`, 5, 60 * 60 * 1000).ok) {
    return {
      ok: false,
      reason: "validation",
      error: "Too many booking attempts from here. Please try again later.",
    };
  }

  if (!hasGoogleCalendarCredentials()) {
    return {
      ok: false,
      reason: "calendar_unreachable",
      error: "Booking is not configured yet. Please email info@nexolmedia.com.",
    };
  }

  // Race protection — final check before insert.
  let free: boolean;
  try {
    free = await isSlotFree(payload.startISO, payload.endISO);
  } catch (err) {
    console.error("[booking] freebusy recheck failed:", err);
    return {
      ok: false,
      reason: "calendar_unreachable",
      error: "Calendar is temporarily unreachable. Try again in a moment.",
    };
  }
  if (!free) {
    return {
      ok: false,
      reason: "slot_taken",
      error: "Someone grabbed that slot — pick another, please.",
    };
  }

  let inserted: Awaited<ReturnType<typeof insertEvent>>;
  try {
    inserted = await insertEvent({
      startISO: payload.startISO,
      endISO: payload.endISO,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      services: payload.services,
      message: payload.message?.trim() || undefined,
    });
  } catch (err) {
    console.error("[booking] events.insert failed:", err);
    return {
      ok: false,
      reason: "calendar_unreachable",
      error: "Could not create the calendar event. Please email us.",
    };
  }

  // Persist the booking to Firestore — non-fatal on failure. Firestore rejects
  // `undefined`, so optional fields fall back to null / [].
  try {
    await getAdminDb()
      .collection(COLLECTIONS.bookingRequests)
      .add({
        bookedAt: new Date().toISOString(),
        startsAt: payload.startISO,
        endsAt: payload.endISO,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        services: payload.services?.length ? payload.services : [],
        message: payload.message?.trim() || null,
        meetLink: inserted.meetLink ?? null,
        eventId: inserted.eventId,
        status: "confirmed",
      });
  } catch (err) {
    console.warn("[booking] Firestore write failed:", err);
  }

  // Branded confirmation via Resend. Google also sends its own invite — this
  // adds a Nexol-branded touch and surfaces the Meet link prominently. The send
  // is best-effort (the booking is already confirmed via the calendar event), but
  // a failure must NOT be swallowed: log it loudly so a misconfigured/down Resend
  // is detectable in server logs instead of users silently missing confirmations.
  const emailResult = await sendTransactionalEmail({
    to: payload.email,
    subject: "Your Nexol Media call is booked",
    replyToOverride: process.env.RESEND_REPLY_TO ?? "info@nexolmedia.com",
    text: buildPlainText(payload, inserted.meetLink),
    html: buildHtml(payload, inserted.meetLink),
  });
  if (!emailResult.ok) {
    console.error(
      `[booking] confirmation email NOT sent to ${payload.email} (${emailResult.reason})` +
        (emailResult.error ? `: ${emailResult.error}` : "") +
        ` — eventId=${inserted.eventId}`,
    );
  }

  const operatorEmail = process.env.BOOKING_OPERATOR_EMAIL;
  if (operatorEmail) {
    const notifyResult = await sendTransactionalEmail({
      to: operatorEmail,
      subject: `New booking: ${payload.name} — ${formatHuman(payload.startISO)}`,
      text: buildOperatorPlainText(payload, inserted.meetLink),
      html: buildOperatorHtml(payload, inserted.meetLink),
    });
    if (!notifyResult.ok) {
      console.error(
        `[booking] operator notification NOT sent (${notifyResult.reason})` +
          (notifyResult.error ? `: ${notifyResult.error}` : "") +
          ` — eventId=${inserted.eventId}`,
      );
    }
  }

  return { ok: true, meetLink: inserted.meetLink };
}

function computeEndISO(startISO: string): string {
  const [, hh, mm] =
    /T(\d{2}):(\d{2}):00\+/.exec(startISO) ?? [];
  if (!hh || !mm) return "";
  const total = parseInt(hh, 10) * 60 + parseInt(mm, 10) + BOOKING_SLOT_MINUTES;
  const newH = String(Math.floor(total / 60)).padStart(2, "0");
  const newM = String(total % 60).padStart(2, "0");
  return startISO.replace(
    /T(\d{2}):(\d{2}):00/,
    `T${newH}:${newM}:00`
  );
}

function buildPlainText(p: BookingPayload, meetLink: string | null): string {
  return [
    `Your Nexol Media call is booked.`,
    ``,
    `When:  ${formatHuman(p.startISO)}`,
    `Where: ${meetLink ?? "Calendar invite contains the Meet link."}`,
    ``,
    `Nitesh will send a calendar invite shortly.`,
    `Reply to this email if anything needs to change.`,
    ``,
    `— Nexol Media`,
  ].join("\n");
}

function buildHtml(p: BookingPayload, meetLink: string | null): string {
  const safeMessage = p.message ? escapeHtml(p.message) : "";
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#FAFAFA;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E8EA;border-radius:16px;padding:28px;">
      <div style="font-family:monospace;font-size:11px;color:#71717A;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;">Booking confirmed · Nexol Media</div>
      <h1 style="margin:0 0 18px;font-size:22px;font-weight:600;color:#0A0A0B;">You're on the calendar, ${escapeHtml(p.name)}.</h1>
      <p style="margin:0 0 6px;font-size:14px;color:#71717A;font-family:monospace;text-transform:uppercase;letter-spacing:.06em;">When</p>
      <p style="margin:0 0 20px;font-size:16px;color:#0A0A0B;">${escapeHtml(formatHuman(p.startISO))}</p>
      ${
        meetLink
          ? `<a href="${escapeHtml(meetLink)}" style="display:inline-block;background:#0A0A0B;color:#FFFFFF;font-size:14px;font-weight:500;padding:12px 18px;border-radius:999px;text-decoration:none;">Join Google Meet</a>`
          : `<p style="margin:0;font-size:14px;color:#27272A;">Your calendar invite will contain the Meet link.</p>`
      }
      ${
        safeMessage
          ? `<div style="border-top:1px solid #E8E8EA;margin-top:24px;padding-top:18px;"><div style="font-family:monospace;font-size:11px;color:#71717A;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;">What you wrote</div><div style="font-size:15px;line-height:1.55;color:#27272A;white-space:pre-wrap;">${safeMessage}</div></div>`
          : ""
      }
      <p style="margin:24px 0 0;font-size:13px;color:#71717A;">Reply to this email if anything needs to change.</p>
    </div>
  </body></html>`;
}

function buildOperatorPlainText(p: BookingPayload, meetLink: string | null): string {
  return [
    `New booking from ${p.name} <${p.email}>`,
    ``,
    `When:     ${formatHuman(p.startISO)}`,
    `Meet:     ${meetLink ?? "See calendar invite."}`,
    p.services?.length ? `Services: ${p.services.join(", ")}` : "",
    p.message ? `Message:\n${p.message}` : "",
  ].filter(Boolean).join("\n");
}

function buildOperatorHtml(p: BookingPayload, meetLink: string | null): string {
  const safeName = escapeHtml(p.name);
  const safeEmail = escapeHtml(p.email);
  const safeMessage = p.message ? escapeHtml(p.message) : "";
  const safeServices = p.services?.length ? escapeHtml(p.services.join(", ")) : "";
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#FAFAFA;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E8EA;border-radius:16px;padding:28px;">
      <div style="font-family:monospace;font-size:11px;color:#71717A;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;">New booking · Nexol Media</div>
      <h1 style="margin:0 0 18px;font-size:22px;font-weight:600;color:#0A0A0B;">Someone booked a call.</h1>
      <p style="margin:0 0 4px;font-size:14px;color:#71717A;font-family:monospace;text-transform:uppercase;letter-spacing:.06em;">Who</p>
      <p style="margin:0 0 16px;font-size:16px;color:#0A0A0B;">${safeName} &lt;<a href="mailto:${safeEmail}" style="color:#0A0A0B;">${safeEmail}</a>&gt;</p>
      <p style="margin:0 0 4px;font-size:14px;color:#71717A;font-family:monospace;text-transform:uppercase;letter-spacing:.06em;">When</p>
      <p style="margin:0 0 16px;font-size:16px;color:#0A0A0B;">${escapeHtml(formatHuman(p.startISO))}</p>
      ${meetLink ? `<a href="${escapeHtml(meetLink)}" style="display:inline-block;background:#0A0A0B;color:#FFFFFF;font-size:14px;font-weight:500;padding:12px 18px;border-radius:999px;text-decoration:none;">Join Google Meet</a>` : ""}
      ${safeServices ? `<p style="margin:16px 0 0;font-size:14px;color:#27272A;"><strong>Interested in:</strong> ${safeServices}</p>` : ""}
      ${safeMessage ? `<div style="border-top:1px solid #E8E8EA;margin-top:20px;padding-top:16px;font-size:15px;line-height:1.55;color:#27272A;white-space:pre-wrap;">${safeMessage}</div>` : ""}
    </div>
  </body></html>`;
}

function formatHuman(startISO: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(new Date(startISO));
}
