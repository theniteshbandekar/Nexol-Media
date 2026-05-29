"use server";

import { requireWriter } from "@/lib/firebase/auth";
import { uploadImage } from "@/lib/firebase/storage";

export type UploadResult =
  | { ok: true; src: string }
  | { ok: false; error: string };

// Accepts a FormData with `file`, `path` (e.g. images/caseStudies/<slug>), and
// `alt`. Uploads via the Admin SDK and returns the tokenized download URL.
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  try {
    await requireWriter();
    const file = formData.get("file");
    const path = String(formData.get("path") ?? "").trim();
    const alt = String(formData.get("alt") ?? "");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "No file selected." };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { ok: false, error: "Image must be under 10 MB." };
    }
    if (!path) return { ok: false, error: "Missing upload path." };

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const dest = `${path}/${Date.now()}-${safeName}`;
    const { src } = await uploadImage({
      buffer,
      contentType: file.type || "application/octet-stream",
      path: dest,
      alt,
    });
    return { ok: true, src };
  } catch (err) {
    console.error("[uploadImageAction]", err);
    const unauthorized =
      err instanceof Error && err.message.startsWith("Unauthorized");
    return {
      ok: false,
      error: unauthorized
        ? "You don't have permission to upload."
        : "Upload failed. Please try again.",
    };
  }
}
