import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { validatePreviewUrl } from "@sanity/preview-url-secret";

import { getSanityClient } from "@/lib/sanity/client";

/**
 * Enables Next.js draft mode after Sanity's Presentation tool calls this
 * route. The Presentation tool generates a short-lived preview secret —
 * we verify it via @sanity/preview-url-secret before flipping draft mode on.
 *
 * Requires SANITY_API_READ_TOKEN (a Viewer token from sanity.io/manage).
 */
export async function GET(request: NextRequest) {
  const client = getSanityClient();
  if (!client) {
    return new Response("Sanity not configured", { status: 500 });
  }

  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
    request.url
  );
  if (!isValid) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();
  redirect(redirectTo);
}
