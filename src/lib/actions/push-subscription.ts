"use server";

import { saveSub, deleteSub, type StoredSubscription } from "@/lib/push-subscriptions";

export async function savePushSubscription(sub: StoredSubscription): Promise<void> {
  try {
    await saveSub(sub);
  } catch (err) {
    console.error("[push-subscription] save failed:", err);
  }
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  try {
    await deleteSub(endpoint);
  } catch {
    // best-effort
  }
}
