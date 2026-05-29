"use server";

import { revalidatePath } from "next/cache";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AdminService } from "@/lib/firebase/admin-content";

import { withAdmin, type ActionResult } from "./_helpers";

function revalidateService(slug: string) {
  revalidatePath("/services");
  revalidatePath("/services/" + slug);
}

export async function saveService(payload: AdminService): Promise<ActionResult> {
  return withAdmin(async () => {
    const slug = payload.slug?.trim();
    if (!slug) throw new Error("Validation: A slug is required.");
    await getAdminDb().collection(COLLECTIONS.services).doc(slug).set(payload);
    revalidateService(slug);
  });
}

export async function createService(payload: AdminService): Promise<ActionResult> {
  return withAdmin(async () => {
    const slug = payload.slug?.trim();
    if (!slug) throw new Error("Validation: A slug is required.");
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Validation: Slug may only contain lowercase letters, numbers and dashes.");
    }
    const ref = getAdminDb().collection(COLLECTIONS.services).doc(slug);
    if ((await ref.get()).exists) {
      throw new Error("Validation: That slug is already taken.");
    }
    await ref.set({ ...payload, slug });
    revalidateService(slug);
  });
}

export async function deleteService(slug: string): Promise<ActionResult> {
  return withAdmin(async () => {
    await getAdminDb().collection(COLLECTIONS.services).doc(slug).delete();
    revalidateService(slug);
  });
}
