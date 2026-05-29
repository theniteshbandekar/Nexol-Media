import "server-only";

import type { BlogAuthor, BlogPost } from "@/lib/blog";
import type { CaseStudy } from "@/lib/case-studies";
import type { Service } from "@/lib/services";

import { getAdminAuth, getAdminDb } from "./admin";
import type { UserRole } from "./auth";
import { COLLECTIONS } from "./collections";

// Editor-facing reads: unlike the public fetchers these do NOT filter on
// `published`, so drafts are visible in the dashboard. The stored docs carry a
// `published` flag the public site honors.
export type AdminService = Service & { published: boolean };
export type AdminCaseStudy = CaseStudy & {
  published: boolean;
  comingSoon: boolean;
};
// A blog post doc carries the public `BlogPost` shape plus the draft flag and
// the author id (the public `author` field is a denormalized snapshot).
export type AdminBlogPost = BlogPost & { published: boolean; authorId: string };
export type AdminAuthor = { id: string } & BlogAuthor;

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

export async function adminListBlogPosts(): Promise<AdminBlogPost[]> {
  const snap = await getAdminDb().collection(COLLECTIONS.blogPosts).get();
  return snap.docs
    .map((d) => d.data() as AdminBlogPost)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function adminGetBlogPost(
  slug: string,
): Promise<AdminBlogPost | null> {
  const doc = await getAdminDb().collection(COLLECTIONS.blogPosts).doc(slug).get();
  return doc.exists ? (doc.data() as AdminBlogPost) : null;
}

export async function adminListAuthors(): Promise<AdminAuthor[]> {
  const snap = await getAdminDb().collection(COLLECTIONS.blogAuthors).get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as BlogAuthor) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function adminGetAuthor(id: string): Promise<AdminAuthor | null> {
  const doc = await getAdminDb().collection(COLLECTIONS.blogAuthors).doc(id).get();
  return doc.exists ? { id: doc.id, ...(doc.data() as BlogAuthor) } : null;
}

export type AdminBooking = {
  id: string;
  bookedAt?: string;
  startsAt?: string;
  endsAt?: string;
  name?: string;
  email?: string;
  services?: string[];
  message?: string | null;
  meetLink?: string | null;
  eventId?: string;
  status?: string;
};

export async function adminListBookings(): Promise<AdminBooking[]> {
  const snap = await getAdminDb().collection(COLLECTIONS.bookingRequests).get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<AdminBooking, "id">) }))
    .sort((a, b) => (b.bookedAt ?? "").localeCompare(a.bookedAt ?? ""));
}

export type AdminUser = { uid: string; email: string | null; role: UserRole | null };

export async function adminListUsers(): Promise<AdminUser[]> {
  const { users } = await getAdminAuth().listUsers(1000);
  return users
    .map((u) => ({
      uid: u.uid,
      email: u.email ?? null,
      role: (u.customClaims?.role as UserRole | undefined) ?? null,
    }))
    .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
}
