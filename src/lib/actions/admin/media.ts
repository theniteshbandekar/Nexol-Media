"use server";

import { requireWriter } from "@/lib/firebase/auth";
import { deleteImage, uploadImage } from "@/lib/firebase/storage";

export type UploadResult =
  | { ok: true; src: string }
  | { ok: false; error: string };

export type DeleteResult = { ok: true } | { ok: false; error: string };

// Confine all storage paths to the `images/` root with no traversal. `path` is
// client-supplied (FormData / delete arg), so this is the server-side trust
// boundary: every segment must be a safe token and `..`/empty segments are
// rejected. Covers both upload destinations (a directory prefix) and deletes
// (a full object path including the filename + extension).
function isSafeStoragePath(path: string): boolean {
  if (!path.startsWith("images/")) return false;
  return path
    .split("/")
    .every(
      (seg) =>
        seg.length > 0 && seg !== "." && seg !== ".." && /^[A-Za-z0-9._-]+$/.test(seg),
    );
}

export async function deleteImageAction(path: string): Promise<DeleteResult> {
  try {
    await requireWriter();
    if (!path) return { ok: false, error: "Missing path." };
    if (!isSafeStoragePath(path)) return { ok: false, error: "Invalid path." };
    await deleteImage(path);
    return { ok: true };
  } catch (err) {
    console.error("[deleteImageAction]", err);
    const unauthorized =
      err instanceof Error && err.message.startsWith("Unauthorized");
    return {
      ok: false,
      error: unauthorized
        ? "You don't have permission to delete."
        : "Delete failed. Please try again.",
    };
  }
}

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
    if (!isSafeStoragePath(path)) return { ok: false, error: "Invalid upload path." };

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
