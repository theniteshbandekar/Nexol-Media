import {
  getSiteSettings,
  type NavItem,
  type RouteKey,
} from "./sanity/site-settings";

export type { NavItem };

/**
 * Returns the primary nav array. Reads from the site settings singleton.
 */
export async function getPrimaryNav(): Promise<NavItem[]> {
  const settings = await getSiteSettings();
  return settings.primaryNav;
}

// First path segment → routeVisibility key. Paths with no mapping (e.g.
// /privacy, /terms) and external links (http(s)/mailto) always pass.
const HREF_TO_ROUTE: Record<string, RouteKey> = {
  blog: "blog",
  "case-studies": "caseStudies",
  services: "services",
  about: "about",
  contact: "contact",
};

/**
 * Drop links pointing at routes hidden via routeVisibility, so the header nav
 * and footer never link to a section that 404s.
 */
export function filterByRouteVisibility<T extends { href: string }>(
  links: T[],
  routeVisibility: Record<RouteKey, boolean>
): T[] {
  return links.filter((link) => {
    if (/^(https?:|mailto:)/.test(link.href)) return true;
    const segment = link.href.replace(/^\//, "").split(/[/?#]/)[0];
    const key = HREF_TO_ROUTE[segment];
    return key ? routeVisibility[key] !== false : true;
  });
}
