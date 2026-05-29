"use server";

import { revalidatePath } from "next/cache";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, SINGLETON_IDS } from "@/lib/firebase/collections";
import type { SiteSettings } from "@/lib/sanity/site-settings";

import { withAdmin, type ActionResult } from "./_helpers";

export async function saveSiteSettings(
  payload: SiteSettings,
): Promise<ActionResult> {
  return withAdmin(async () => {
    await getAdminDb()
      .collection(COLLECTIONS.singletons)
      .doc(SINGLETON_IDS.siteSettings)
      .set(payload);
    // Nav/footer + routeVisibility affect the layout and every page + sitemap.
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
  });
}
