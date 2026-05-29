// Client-safe blog helpers — pure, no server/Admin-SDK imports — so client
// components (e.g. blog-index-shell) can use them without pulling firebase-admin
// into the browser bundle. Re-exported from ./blog for server importers.

export const blogCategories = [
  "All",
  "Growth",
  "Editing",
  "AI tools",
  "Distribution",
  "Behind the scenes",
] as const;
export type BlogCategory = (typeof blogCategories)[number];
export type BlogPostCategory = Exclude<BlogCategory, "All">;

export function formatPostDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatPostDateLong(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
