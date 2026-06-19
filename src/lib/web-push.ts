import webpush from "web-push";
import type { StoredSubscription } from "@/lib/push-subscriptions";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

export function hasVapidCredentials(): boolean {
  return Boolean(vapidPublicKey && vapidPrivateKey);
}

if (hasVapidCredentials()) {
  webpush.setVapidDetails(
    "mailto:info@nexolmedia.com",
    vapidPublicKey!,
    vapidPrivateKey!
  );
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function sendAdminPush(
  sub: StoredSubscription,
  payload: PushPayload
): Promise<{ ok: boolean; gone?: boolean }> {
  if (!hasVapidCredentials()) return { ok: false };
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    return { ok: true };
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) return { ok: false, gone: true };
    console.error("[web-push] send failed:", err);
    return { ok: false };
  }
}
