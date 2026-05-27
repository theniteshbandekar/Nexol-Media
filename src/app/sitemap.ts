import type { MetadataRoute } from "next";

import { getAllBlogPosts, isThinPost } from "@/lib/blog";
import { getAllCaseStudies } from "@/lib/case-studies";
import { getAllServices } from "@/lib/services";
import { getSiteSettings } from "@/lib/sanity/site-settings";
import { SITE_URL } from "@/lib/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;
  const settings = await getSiteSettings();
  const visible = settings.routeVisibility;

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: url("/"),
      lastModified: today,
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];

  if (visible.about) {
    staticEntries.push({
      url: url("/about"),
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }
  if (visible.services) {
    staticEntries.push({
      url: url("/services"),
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }
  if (visible.caseStudies) {
    staticEntries.push({
      url: url("/case-studies"),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [url("/case-studies/adrien-ninet.png")],
    });
  }
  if (visible.blog) {
    staticEntries.push({
      url: url("/blog"),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }
  if (visible.contact) {
    staticEntries.push({
      url: url("/contact"),
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  const [services, caseStudies, blogPosts] = await Promise.all([
    getAllServices(),
    getAllCaseStudies(),
    getAllBlogPosts(),
  ]);

  const serviceEntries: MetadataRoute.Sitemap = visible.services
    ? services.map((s) => ({
        url: url(`/services/${s.slug}`),
        lastModified: today,
        changeFrequency: "monthly",
        priority: s.slug === "clipping" ? 0.85 : 0.7,
      }))
    : [];

  const caseStudyEntries: MetadataRoute.Sitemap = visible.caseStudies
    ? caseStudies
        .filter((c) => !c.comingSoon && c.rows && c.rows.length > 0)
        .map((c) => ({
          url: url(`/case-studies/${c.slug}`),
          lastModified: c.publishedAt ? new Date(c.publishedAt) : today,
          changeFrequency: "monthly",
          priority: c.slug === "adrien-ninet" ? 0.85 : 0.7,
          images: c.cardImage ? [c.cardImage.src.startsWith("http") ? c.cardImage.src : url(c.cardImage.src)] : undefined,
        }))
    : [];

  const blogEntries: MetadataRoute.Sitemap = visible.blog
    ? blogPosts
        .filter((p) => !isThinPost(p))
        .map((p) => ({
          url: url(`/blog/${p.slug}`),
          lastModified: new Date(p.modifiedAt ?? p.publishedAt),
          changeFrequency: "monthly",
          priority: p.featured ? 0.7 : 0.6,
        }))
    : [];

  return [
    ...staticEntries,
    ...serviceEntries,
    ...caseStudyEntries,
    ...blogEntries,
  ];
}
