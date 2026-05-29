"use server";

import { revalidatePath } from "next/cache";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, SINGLETON_IDS } from "@/lib/firebase/collections";
import type { CaseStudiesIndex, ServicesIndex } from "@/lib/sanity/index-pages";

import { withAdmin, type ActionResult } from "./_helpers";

export async function saveServicesIndex(
  payload: ServicesIndex,
): Promise<ActionResult> {
  return withAdmin(async () => {
    await getAdminDb()
      .collection(COLLECTIONS.singletons)
      .doc(SINGLETON_IDS.servicesIndex)
      .set(payload);
    revalidatePath("/services");
  });
}

export async function saveCaseStudiesIndex(
  payload: CaseStudiesIndex,
): Promise<ActionResult> {
  return withAdmin(async () => {
    await getAdminDb()
      .collection(COLLECTIONS.singletons)
      .doc(SINGLETON_IDS.caseStudiesIndex)
      .set(payload);
    revalidatePath("/case-studies");
  });
}
