import "server-only";

import { calendar as calendarApi, type calendar_v3 } from "@googleapis/calendar";
import { OAuth2Client } from "google-auth-library";

import {
  BOOKING_HOUR_END,
  BOOKING_HOUR_START,
  BOOKING_SLOT_MINUTES,
  BOOKING_TIMEZONE,
  BOOKING_TZ_OFFSET,
} from "./booking-constants";

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

export function hasGoogleCalendarCredentials(): boolean {
  return Boolean(clientId && clientSecret && refreshToken);
}

let cachedClient: calendar_v3.Calendar | null = null;

function getCalendar(): calendar_v3.Calendar | null {
  if (!hasGoogleCalendarCredentials()) return null;
  if (cachedClient) return cachedClient;
  const auth = new OAuth2Client({ clientId, clientSecret });
  auth.setCredentials({ refresh_token: refreshToken });
  cachedClient = calendarApi({ version: "v3", auth });
  return cachedClient;
}

/**
 * Build the 30-minute slot starts for a calendar day in the booking zone.
 * Returns RFC3339 strings with the booking timezone offset baked in so
 * Google interprets them at the right instant regardless of server TZ.
 */
export function buildDaySlots(
  dateISO: string
): { startISO: string; endISO: string }[] {
  const slots: { startISO: string; endISO: string }[] = [];
  for (let h = BOOKING_HOUR_START; h < BOOKING_HOUR_END; h++) {
    for (let m = 0; m < 60; m += BOOKING_SLOT_MINUTES) {
      const startH = String(h).padStart(2, "0");
      const startM = String(m).padStart(2, "0");
      const endTotal = h * 60 + m + BOOKING_SLOT_MINUTES;
      const endH = String(Math.floor(endTotal / 60)).padStart(2, "0");
      const endM = String(endTotal % 60).padStart(2, "0");
      slots.push({
        startISO: `${dateISO}T${startH}:${startM}:00${BOOKING_TZ_OFFSET}`,
        endISO: `${dateISO}T${endH}:${endM}:00${BOOKING_TZ_OFFSET}`,
      });
    }
  }
  return slots;
}

export function getDayWindow(dateISO: string): {
  timeMin: string;
  timeMax: string;
} {
  const startH = String(BOOKING_HOUR_START).padStart(2, "0");
  const endH = String(BOOKING_HOUR_END).padStart(2, "0");
  return {
    timeMin: `${dateISO}T${startH}:00:00${BOOKING_TZ_OFFSET}`,
    timeMax: `${dateISO}T${endH}:00:00${BOOKING_TZ_OFFSET}`,
  };
}

/** Busy intervals (as UTC ms ranges) for the given day window. */
export async function getBusyRanges(
  dateISO: string
): Promise<{ startMs: number; endMs: number }[]> {
  const cal = getCalendar();
  if (!cal) return [];
  const { timeMin, timeMax } = getDayWindow(dateISO);

  const res = await cal.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: BOOKING_TIMEZONE,
      items: [{ id: calendarId }],
    },
  });

  const busy = res.data.calendars?.[calendarId]?.busy ?? [];
  return busy
    .filter((b) => b.start && b.end)
    .map((b) => ({
      startMs: new Date(b.start!).getTime(),
      endMs: new Date(b.end!).getTime(),
    }));
}

/** True when the [startMs, endMs) window doesn't overlap any busy range. */
export async function isSlotFree(
  startISO: string,
  endISO: string
): Promise<boolean> {
  const cal = getCalendar();
  if (!cal) return false;

  const res = await cal.freebusy.query({
    requestBody: {
      timeMin: startISO,
      timeMax: endISO,
      timeZone: BOOKING_TIMEZONE,
      items: [{ id: calendarId }],
    },
  });

  const busy = res.data.calendars?.[calendarId]?.busy ?? [];
  return busy.length === 0;
}

export type InsertedEvent = {
  eventId: string;
  meetLink: string | null;
  htmlLink: string | null;
};

export async function insertEvent(args: {
  startISO: string;
  endISO: string;
  name: string;
  email: string;
  services?: string[];
  message?: string;
}): Promise<InsertedEvent> {
  const cal = getCalendar();
  if (!cal) throw new Error("Google Calendar not configured.");

  const operatorEmail = process.env.BOOKING_OPERATOR_EMAIL;
  const attendees: { email: string }[] = [{ email: args.email }];
  if (operatorEmail) attendees.push({ email: operatorEmail });

  const lines: string[] = [];
  if (args.services?.length) {
    lines.push(`Interested in: ${args.services.join(", ")}`);
  }
  if (args.message) lines.push(args.message);
  lines.push("Booked via nexolmedia.com");
  const description = lines.join("\n\n");

  const res = await cal.events.insert({
    calendarId,
    sendUpdates: "all",
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Nexol Media intro — ${args.name}`,
      description,
      start: { dateTime: args.startISO, timeZone: BOOKING_TIMEZONE },
      end: { dateTime: args.endISO, timeZone: BOOKING_TIMEZONE },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    },
  });

  const meetLink =
    res.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video"
    )?.uri ?? res.data.hangoutLink ?? null;

  return {
    eventId: res.data.id ?? "",
    meetLink,
    htmlLink: res.data.htmlLink ?? null,
  };
}
