import "server-only";

import { randomUUID } from "node:crypto";

import { getAdminStorage } from "./admin";

// Images are stored on documents in the {src, alt} shape the view types expect
// (matching StoryPhoto.src / cardImage.src), so the fetcher mapping stays an
// identity.
export type StoredImage = { src: string; alt: string };

/**
 * Upload an image to Storage and return a tokenized public download URL plus
 * alt text. The download URL works regardless of Storage security rules, so
 * the bucket can stay locked to direct client access. Path convention:
 * images/{collection}/{slug}/{filename}.
 */
export async function uploadImage(params: {
  buffer: Buffer;
  contentType: string;
  path: string;
  alt: string;
}): Promise<StoredImage> {
  const bucket = getAdminStorage().bucket();
  const file = bucket.file(params.path);
  const token = randomUUID();

  await file.save(params.buffer, {
    contentType: params.contentType,
    metadata: {
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const src = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    params.path,
  )}?alt=media&token=${token}`;

  return { src, alt: params.alt };
}
