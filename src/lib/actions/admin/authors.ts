"use server";

import { revalidatePath } from "next/cache";

import type { BlogAuthor } from "@/lib/blog";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AdminAuthor } from "@/lib/firebase/admin-content";

import { withWriter, type ActionResult } from "./_helpers";

function authorId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `author-${slug}`;
}

function toAuthor(payload: AdminAuthor): BlogAuthor {
  return {
    name: payload.name.trim(),
    role: payload.role.trim(),
    initials: payload.initials.trim(),
  };
}

// Posts store a denormalized author snapshot; keep them in sync on edit.
async function syncPostSnapshots(id: string, author: BlogAuthor) {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTIONS.blogPosts)
    .where("authorId", "==", id)
    .get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.update(d.ref, { author }));
  await batch.commit();
  revalidatePath("/blog");
}

export async function saveAuthor(payload: AdminAuthor): Promise<ActionResult> {
  return withWriter(async () => {
    if (!payload.name?.trim()) throw new Error("Validation: A name is required.");
    if (!payload.id) throw new Error("Validation: Missing author id.");
    const author = toAuthor(payload);
    await getAdminDb().collection(COLLECTIONS.blogAuthors).doc(payload.id).set(author);
    await syncPostSnapshots(payload.id, author);
  });
}

export async function createAuthor(payload: AdminAuthor): Promise<ActionResult> {
  return withWriter(async () => {
    if (!payload.name?.trim()) throw new Error("Validation: A name is required.");
    const id = authorId(payload.name);
    const ref = getAdminDb().collection(COLLECTIONS.blogAuthors).doc(id);
    if ((await ref.get()).exists) {
      throw new Error("Validation: An author with that name already exists.");
    }
    await ref.set(toAuthor(payload));
  });
}

export async function deleteAuthor(id: string): Promise<ActionResult> {
  return withWriter(async () => {
    await getAdminDb().collection(COLLECTIONS.blogAuthors).doc(id).delete();
  });
}
