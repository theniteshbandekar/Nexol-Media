"use server";

import { revalidatePath } from "next/cache";

import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import type { UserRole } from "@/lib/firebase/auth";
import { COLLECTIONS } from "@/lib/firebase/collections";

import { withAdmin, type ActionResult } from "./_helpers";

export async function setUserRole(
  uid: string,
  role: UserRole,
): Promise<ActionResult> {
  return withAdmin(async () => {
    if (role !== "admin" && role !== "writer") {
      throw new Error("Validation: Invalid role.");
    }
    const auth = getAdminAuth();
    const user = await auth.getUser(uid);
    // The custom claim is authoritative for authorization; the users doc mirrors
    // it for listing. The claim only takes effect on the user's next sign-in.
    await auth.setCustomUserClaims(uid, { role });
    await getAdminDb()
      .collection(COLLECTIONS.users)
      .doc(uid)
      .set({ email: user.email ?? null, role }, { merge: true });
    revalidatePath("/admin/users");
  });
}
