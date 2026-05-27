import { createClient, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = "2024-10-01";

/**
 * True when Sanity env vars are populated. Used by the data-lib helpers
 * to decide whether to fetch from Sanity or fall back to the legacy
 * TypeScript arrays during the migration period.
 */
export function hasSanityCredentials(): boolean {
  return Boolean(projectId);
}

let cached: SanityClient | null = null;
let cachedWrite: SanityClient | null = null;

export function getSanityClient(): SanityClient | null {
  if (!hasSanityCredentials() || !projectId) return null;
  if (cached) return cached;
  cached = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: "published",
    token: process.env.SANITY_API_READ_TOKEN,
  });
  return cached;
}

/**
 * Runtime write client for server actions (e.g. contact form submission).
 * Requires SANITY_API_WRITE_TOKEN. Returns null if not configured — caller
 * should treat that as "skip Sanity write, still send email".
 */
export function getSanityWriteClient(): SanityClient | null {
  if (!projectId) return null;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return null;
  if (cachedWrite) return cachedWrite;
  cachedWrite = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
  return cachedWrite;
}

export const SANITY_PROJECT_ID = projectId;
export const SANITY_DATASET = dataset;
