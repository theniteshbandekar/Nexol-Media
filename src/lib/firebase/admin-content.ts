import "server-only";

import type { CaseStudy } from "@/lib/case-studies";
import type { Service } from "@/lib/services";

import { getAdminDb } from "./admin";
import { COLLECTIONS } from "./collections";

// Editor-facing reads: unlike the public fetchers these do NOT filter on
// `published`, so drafts are visible in the dashboard. The stored docs carry a
// `published` flag the public site honors.
export type AdminService = Service & { published: boolean };
export type AdminCaseStudy = CaseStudy & {
  published: boolean;
  comingSoon: boolean;
};

export async function adminListServices(): Promise<AdminService[]> {
  const snap = await getAdminDb().collection(COLLECTIONS.services).get();
  return snap.docs
    .map((d) => d.data() as AdminService)
    .sort((a, b) => a.num.localeCompare(b.num));
}

export async function adminGetService(slug: string): Promise<AdminService | null> {
  const doc = await getAdminDb().collection(COLLECTIONS.services).doc(slug).get();
  return doc.exists ? (doc.data() as AdminService) : null;
}

export async function adminListCaseStudies(): Promise<AdminCaseStudy[]> {
  const snap = await getAdminDb().collection(COLLECTIONS.caseStudies).get();
  return snap.docs
    .map((d) => d.data() as AdminCaseStudy)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
}

export async function adminGetCaseStudy(
  slug: string,
): Promise<AdminCaseStudy | null> {
  const doc = await getAdminDb()
    .collection(COLLECTIONS.caseStudies)
    .doc(slug)
    .get();
  return doc.exists ? (doc.data() as AdminCaseStudy) : null;
}
