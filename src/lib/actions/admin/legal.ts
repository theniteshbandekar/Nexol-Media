"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { LegalBlock, LegalPage } from "@/lib/sanity/legal-pages";

import { withAdmin, type ActionResult } from "./_helpers";

// Ensure every block/span has the Portable-Text shape + a stable key the
// renderer (legal-page.tsx) expects.
function normalizeBlocks(blocks: LegalBlock[]): LegalBlock[] {
  return (blocks ?? []).map((b) => ({
    _type: "block",
    _key: b._key || randomUUID(),
    style: b.style || "normal",
    ...(b.listItem ? { listItem: b.listItem, level: b.level ?? 1 } : {}),
    children: (b.children ?? []).map((c) => ({
      _type: "span",
      _key: c._key || randomUUID(),
      text: c.text ?? "",
      marks: c.marks ?? [],
    })),
    markDefs: b.markDefs ?? [],
  }));
}

export async function saveLegalPage(payload: LegalPage): Promise<ActionResult> {
  return withAdmin(async () => {
    const kind = payload.kind;
    if (kind !== "privacy" && kind !== "terms") {
      throw new Error("Validation: Unknown legal page.");
    }
    await getAdminDb()
      .collection(COLLECTIONS.legalPages)
      .doc(kind)
      .set({
        kind,
        title:
          payload.title?.trim() ||
          (kind === "privacy" ? "Privacy policy" : "Terms of service"),
        intro: payload.intro?.trim() || null,
        body: normalizeBlocks(payload.body),
        lastUpdated: payload.lastUpdated?.trim() || null,
      });
    revalidatePath("/" + kind);
  });
}
