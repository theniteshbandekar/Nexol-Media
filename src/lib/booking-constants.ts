/**
 * Booking business rules shared between the picker UI (client) and the
 * server actions. Keep timezone-agnostic: anything that needs UTC math
 * lives in google-calendar.ts.
 */

export const BOOKING_TIMEZONE = "Asia/Kolkata" as const;
export const BOOKING_TZ_OFFSET = "+05:30" as const;
export const BOOKING_HOUR_START = 10;
export const BOOKING_HOUR_END = 18;
export const BOOKING_SLOT_MINUTES = 30;
export const BOOKING_MIN_ADVANCE_HOURS = 2;
export const BOOKING_WINDOW_DAYS = 14;

/** ISO weekday numbers we accept (1 = Mon … 7 = Sun). Weekends are off. */
export const BOOKING_WEEKDAYS = new Set([1, 2, 3, 4, 5]);

/**
 * Returns `YYYY-MM-DD` in the booking timezone for a given Date. We avoid
 * `toLocaleDateString` quirks by using Intl with explicit parts.
 */
export function toBookingDateISO(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${day}`;
}

/** ISO weekday (1–7) for a `YYYY-MM-DD` date in the booking timezone. */
export function isoWeekday(dateISO: string): number {
  // Anchor at noon in the booking zone so the UTC instant stays on the same calendar day.
  const d = new Date(`${dateISO}T12:00:00${BOOKING_TZ_OFFSET}`);
  const jsDay = d.getUTCDay(); // 0 = Sun … 6 = Sat
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Human label for a date in the booking timezone (e.g. "Thu 29 May").
 * Accepts either a bare `YYYY-MM-DD` or a full datetime ISO; only the date
 * portion is used.
 */
export function formatBookingDay(dateISO: string): string {
  const datePart = dateISO.slice(0, 10);
  const d = new Date(`${datePart}T12:00:00${BOOKING_TZ_OFFSET}`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

/** "10:30" given a slot ISO start with the booking timezone offset. */
export function formatBookingTime(startISO: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(startISO));
}
