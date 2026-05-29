import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, SINGLETON_IDS } from "@/lib/firebase/collections";

export type RouteKey =
  | "blog"
  | "caseStudies"
  | "services"
  | "about"
  | "contact";

export type FooterLink = { label: string; href: string; external?: boolean };
export type NavItem = { label: string; href: string };

export type SiteSettings = {
  primaryNav: NavItem[];
  headerCtaLabel: string;
  headerCtaHref: string;
  footerTagline: string;
  footerServices: FooterLink[];
  footerCompany: FooterLink[];
  footerConnect: FooterLink[];
  footerLocation: string;
  footerRights: string;
  routeVisibility: Record<RouteKey, boolean>;
};

export const FALLBACK: SiteSettings = {
  primaryNav: [
    { label: "Services", href: "/services" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  headerCtaLabel: "Book a Call",
  headerCtaHref: "/contact#book",
  footerTagline:
    "Polished videos and real growth for Tech, AI, and Design creators.",
  footerServices: [
    { label: "Personal Brand", href: "/services/personal-brand" },
    { label: "Post Production", href: "/services/post-production" },
    { label: "Podcast Distribution", href: "/services/podcast-distribution" },
    { label: "Launch Videos", href: "/services/launch-videos" },
    { label: "Clipping", href: "/services/clipping" },
  ],
  footerCompany: [
    { label: "Case Studies", href: "/case-studies" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
  footerConnect: [
    {
      label: "Instagram ↗",
      href: "https://www.instagram.com/nexolmedia",
      external: true,
    },
    {
      label: "X / Twitter ↗",
      href: "https://x.com/nexolmedia",
      external: true,
    },
    { label: "info@nexolmedia.com", href: "mailto:info@nexolmedia.com" },
    { label: "Book a Call", href: "/contact#book" },
  ],
  footerLocation: "Mumbai · Worldwide",
  footerRights: "All rights reserved",
  routeVisibility: {
    blog: true,
    caseStudies: true,
    services: true,
    about: true,
    contact: true,
  },
};

let cached: SiteSettings | undefined;

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cached) return cached;
  try {
    const doc = await getAdminDb()
      .collection(COLLECTIONS.singletons)
      .doc(SINGLETON_IDS.siteSettings)
      .get();
    const raw = (doc.data() as Partial<SiteSettings> | undefined) ?? null;
    if (!raw) {
      cached = FALLBACK;
      return cached;
    }
    cached = {
      primaryNav: raw.primaryNav?.length ? raw.primaryNav : FALLBACK.primaryNav,
      headerCtaLabel: raw.headerCtaLabel ?? FALLBACK.headerCtaLabel,
      headerCtaHref: raw.headerCtaHref ?? FALLBACK.headerCtaHref,
      footerTagline: raw.footerTagline ?? FALLBACK.footerTagline,
      footerServices: raw.footerServices?.length
        ? raw.footerServices
        : FALLBACK.footerServices,
      footerCompany: raw.footerCompany?.length
        ? raw.footerCompany
        : FALLBACK.footerCompany,
      footerConnect: raw.footerConnect?.length
        ? raw.footerConnect
        : FALLBACK.footerConnect,
      footerLocation: raw.footerLocation ?? FALLBACK.footerLocation,
      footerRights: raw.footerRights ?? FALLBACK.footerRights,
      routeVisibility: {
        ...FALLBACK.routeVisibility,
        ...(raw.routeVisibility ?? {}),
      },
    };
    return cached;
  } catch (err) {
    console.warn("[siteSettings] Firestore fetch failed; using fallback.", err);
    cached = FALLBACK;
    return cached;
  }
}

export function isRouteHidden(
  settings: SiteSettings,
  route: RouteKey
): boolean {
  return settings.routeVisibility[route] === false;
}
