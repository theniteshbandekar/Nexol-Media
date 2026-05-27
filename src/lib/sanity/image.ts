import imageUrlBuilder from "@sanity/image-url";

import { SANITY_DATASET, SANITY_PROJECT_ID } from "./client";

const builder = SANITY_PROJECT_ID
  ? imageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET })
  : null;

/** Accept any image-shaped value — Sanity's own image source type. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyImageSource = any;

/**
 * Returns a Sanity image URL builder. Callers chain `.width()`,
 * `.format()`, etc., and finish with `.url()`.
 *
 * Returns `null` when Sanity isn't configured yet (during pre-setup),
 * so callers should fall back to a placeholder.
 */
export function urlFor(source: AnyImageSource | undefined | null) {
  if (!source || !builder) return null;
  return builder.image(source);
}
