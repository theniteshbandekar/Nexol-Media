"use server";

import { revalidatePath } from "next/cache";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, SINGLETON_IDS } from "@/lib/firebase/collections";
import type { HomePage } from "@/lib/sanity/home-page";

import { withAdmin, type ActionResult } from "./_helpers";

export async function saveHomePage(payload: HomePage): Promise<ActionResult> {
  return withAdmin(async () => {
    await getAdminDb()
      .collection(COLLECTIONS.singletons)
      .doc(SINGLETON_IDS.homePage)
      .set(payload);
    revalidatePath("/");
  });
}
