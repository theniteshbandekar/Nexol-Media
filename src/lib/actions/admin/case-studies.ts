"use server";

import { revalidatePath } from "next/cache";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AdminCaseStudy } from "@/lib/firebase/admin-content";

import { withAdmin, type ActionResult } from "./_helpers";

function revalidateCaseStudy(slug: string) {
  revalidatePath("/case-studies");
  revalidatePath("/case-studies/" + slug);
}

export async function saveCaseStudy(
  payload: AdminCaseStudy,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const slug = payload.slug?.trim();
    if (!slug) throw new Error("Validation: A slug is required.");
    await getAdminDb().collection(COLLECTIONS.caseStudies).doc(slug).set(payload);
    revalidateCaseStudy(slug);
  });
}

export async function createCaseStudy(
  payload: AdminCaseStudy,
): Promise<ActionResult> {
  return withAdmin(async () => {
    const slug = payload.slug?.trim();
    if (!slug) throw new Error("Validation: A slug is required.");
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Validation: Slug may only contain lowercase letters, numbers and dashes.");
    }
    const ref = getAdminDb().collection(COLLECTIONS.caseStudies).doc(slug);
    if ((await ref.get()).exists) {
      throw new Error("Validation: That slug is already taken.");
    }
    await ref.set({ ...payload, slug });
    revalidateCaseStudy(slug);
  });
}

export async function deleteCaseStudy(slug: string): Promise<ActionResult> {
  return withAdmin(async () => {
    await getAdminDb().collection(COLLECTIONS.caseStudies).doc(slug).delete();
    revalidateCaseStudy(slug);
  });
}
