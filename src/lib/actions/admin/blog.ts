"use server";

import { revalidatePath } from "next/cache";

import type { BlogBlock } from "@/lib/blog";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AdminBlogPost } from "@/lib/firebase/admin-content";

import { withWriter, type ActionResult } from "./_helpers";

function revalidateBlog(slug: string) {
  revalidatePath("/blog");
  revalidatePath("/blog/" + slug);
  revalidatePath("/sitemap.xml");
}

// h2 numbers are presentation, not authored — assign a zero-padded running
// count and strip any "(NN)" the writer typed. List items are trimmed of blanks.
function normalizeBody(body: BlogBlock[]): BlogBlock[] {
  let h2 = 0;
  return body.map((block) => {
    if (block.kind === "h2") {
      h2 += 1;
      return {
        ...block,
        num: String(h2).padStart(2, "0"),
        text: block.text.replace(/^\s*\(\d+\)\s*/, "").trim(),
      };
    }
    if (block.kind === "ol" || block.kind === "ul") {
      return { ...block, items: block.items.map((i) => i.trim()).filter(Boolean) };
    }
    return block;
  });
}

function toDoc(payload: AdminBlogPost) {
  return {
    ...payload,
    slug: payload.slug.trim(),
    body: normalizeBody(payload.body ?? []),
    featured: payload.featured ?? false,
    published: payload.published ?? false,
  };
}

function validate(payload: AdminBlogPost): string | null {
  if (!payload.slug?.trim()) return "A slug is required.";
  if (!payload.title?.trim()) return "A title is required.";
  if (!payload.authorId) return "Pick an author.";
  return null;
}

export async function saveBlogPost(payload: AdminBlogPost): Promise<ActionResult> {
  return withWriter(async () => {
    const err = validate(payload);
    if (err) throw new Error("Validation: " + err);
    const slug = payload.slug.trim();
    await getAdminDb().collection(COLLECTIONS.blogPosts).doc(slug).set(toDoc(payload));
    revalidateBlog(slug);
  });
}

export async function createBlogPost(payload: AdminBlogPost): Promise<ActionResult> {
  return withWriter(async () => {
    const err = validate(payload);
    if (err) throw new Error("Validation: " + err);
    const slug = payload.slug.trim();
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(
        "Validation: Slug may only contain lowercase letters, numbers and dashes.",
      );
    }
    const ref = getAdminDb().collection(COLLECTIONS.blogPosts).doc(slug);
    if ((await ref.get()).exists) {
      throw new Error("Validation: That slug is already taken.");
    }
    await ref.set(toDoc(payload));
    revalidateBlog(slug);
  });
}

export async function deleteBlogPost(slug: string): Promise<ActionResult> {
  return withWriter(async () => {
    await getAdminDb().collection(COLLECTIONS.blogPosts).doc(slug).delete();
    revalidateBlog(slug);
  });
}
