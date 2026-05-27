import { groq } from "next-sanity";

const PUBLISHED = `&& published == true`;

// Repeated projections kept here so query shape stays consistent across calls.
const BLOG_POST_PROJECTION = groq`{
  "slug": slug.current,
  title,
  dek,
  category,
  publishedAt,
  modifiedAt,
  readTimeMinutes,
  tags,
  featured,
  "author": author->{ name, role, initials },
  heroImage,
  heroLabel,
  body
}`;

const CASE_STUDY_PROJECTION = groq`{
  "slug": slug.current,
  name,
  role,
  description,
  publishedAt,
  comingSoon,
  cardImage,
  title,
  stats,
  rows,
  ctaHook,
  published
}`;

const SERVICE_PROJECTION = groq`{
  "slug": slug.current,
  num,
  title,
  tagline,
  pills,
  description,
  deliverablesMeta,
  deliverables,
  workHeading,
  workMeta,
  "workSamples": workSamples[]{
    label,
    image,
    "caseStudySlug": caseStudy->slug.current
  },
  metricsMeta,
  metrics,
  processMeta,
  process,
  ctaHeading,
  faqs
}`;

export const allBlogPostsQuery = groq`*[_type == "blogPost" ${PUBLISHED}] | order(publishedAt desc) ${BLOG_POST_PROJECTION}`;
export const blogPostBySlugQuery = groq`*[_type == "blogPost" && slug.current == $slug ${PUBLISHED}][0] ${BLOG_POST_PROJECTION}`;
export const featuredPostQuery = groq`*[_type == "blogPost" && featured == true ${PUBLISHED}] | order(publishedAt desc) [0] ${BLOG_POST_PROJECTION}`;

export const allCaseStudiesQuery = groq`*[_type == "caseStudy" && published == true] | order(comingSoon asc, publishedAt desc) ${CASE_STUDY_PROJECTION}`;
export const caseStudyBySlugQuery = groq`*[_type == "caseStudy" && slug.current == $slug && published == true][0] ${CASE_STUDY_PROJECTION}`;

export const allServicesQuery = groq`*[_type == "service" && published == true] | order(num asc) ${SERVICE_PROJECTION}`;
export const serviceBySlugQuery = groq`*[_type == "service" && slug.current == $slug && published == true][0] ${SERVICE_PROJECTION}`;

export const homePageQuery = groq`*[_type == "homePage"][0]{
  hero,
  vsl,
  stats,
  testimonials,
  hook
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  primaryNav,
  headerCtaLabel,
  headerCtaHref,
  footerTagline,
  footerServices,
  footerCompany,
  footerConnect,
  footerLocation,
  footerRights,
  routeVisibility
}`;

/** Slug-only queries used by generateStaticParams (cheap). */
export const allBlogSlugsQuery = groq`*[_type == "blogPost"]{ "slug": slug.current }`;
export const allCaseStudySlugsQuery = groq`*[_type == "caseStudy"]{ "slug": slug.current }`;
export const allServiceSlugsQuery = groq`*[_type == "service"]{ "slug": slug.current }`;
