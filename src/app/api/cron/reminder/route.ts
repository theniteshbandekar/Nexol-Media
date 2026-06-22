import { type NextRequest, NextResponse } from "next/server";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { getSubs, deleteSub } from "@/lib/push-subscriptions";
import { hasVapidCredentials, sendAdminPush } from "@/lib/web-push";
import { formatBookingTime } from "@/lib/booking-constants";

export const runtime = "nodejs";
// Do not cache — always run fresh.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasVapidCredentials()) {
    return NextResponse.json({ skipped: "no_vapid_credentials" });
  }

  const now = Date.now();
  // Window: 10–25 min from now. Absorbs GitHub Actions cron jitter (±10 min).
  const windowStart = new Date(now + 10 * 60 * 1000).toISOString();
  const windowEnd   = new Date(now + 25 * 60 * 1000).toISOString();

  const snap = await getAdminDb()
    .collection(COLLECTIONS.bookingRequests)
    .where("status", "==", "confirmed")
    .where("startsAt", ">=", windowStart)
    .where("startsAt", "<=", windowEnd)
    .get();

  // Only bookings with a real Meet link and no prior reminder.
  const due = snap.docs.filter((d) => {
    const data = d.data();
    return data.meetLink && !data.reminderSentAt;
  });
  if (due.length === 0) {
    return NextResponse.json({ reminded: 0 });
  }

  const subs = await getSubs();
  let reminded = 0;

  for (const doc of due) {
    const b = doc.data();
    // Tapping the notification opens Meet directly if a link exists.
    const url = (b.meetLink as string | null) ?? "/admin/bookings";
    const time = b.startsAt ? formatBookingTime(b.startsAt as string) : "soon";
    const name = (b.name as string | null) ?? "Guest";

    await Promise.all(
      subs.map(async (sub) => {
        const result = await sendAdminPush(sub, {
          title: "Meeting in 15 min",
          body: `${name} · ${time} IST`,
          url,
        });
        if (result.gone) await deleteSub(sub.endpoint);
      })
    );

    // Mark as reminded so subsequent cron runs skip this booking.
    await doc.ref.update({ reminderSentAt: new Date().toISOString() });
    reminded++;
  }

  return NextResponse.json({ reminded });
}
