import { getSiteSettings, type NavItem } from "./sanity/site-settings";

export type { NavItem };

/**
 * Returns the primary nav array. Reads from Sanity siteSettings when
 * configured; falls back to a sensible default otherwise.
 */
export async function getPrimaryNav(): Promise<NavItem[]> {
  const settings = await getSiteSettings();
  return settings.primaryNav;
}
