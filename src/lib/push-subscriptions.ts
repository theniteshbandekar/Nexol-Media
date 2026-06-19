import { getAdminDb } from "@/lib/firebase/admin";

const COL = "adminPushSubscriptions";

export type StoredSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

function subId(endpoint: string): string {
  return Buffer.from(endpoint).toString("base64url").slice(0, 128);
}

export async function saveSub(sub: StoredSubscription): Promise<void> {
  await getAdminDb()
    .collection(COL)
    .doc(subId(sub.endpoint))
    .set({ ...sub, savedAt: new Date().toISOString() });
}

export async function getSubs(): Promise<StoredSubscription[]> {
  const snap = await getAdminDb().collection(COL).get();
  return snap.docs.map((d) => d.data() as StoredSubscription);
}

export async function deleteSub(endpoint: string): Promise<void> {
  await getAdminDb().collection(COL).doc(subId(endpoint)).delete();
}
