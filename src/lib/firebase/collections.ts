// Firestore collection names + singleton document ids. Single source of truth
// so fetchers, server actions, and the seed script never hard-code strings.

export const COLLECTIONS = {
  blogPosts: "blogPosts",
  blogAuthors: "blogAuthors",
  caseStudies: "caseStudies",
  services: "services",
  legalPages: "legalPages",
  contactSubmissions: "contactSubmissions",
  bookingRequests: "bookingRequests",
  users: "users",
  singletons: "singletons",
} as const;

// Documents inside the `singletons` collection (one doc per site-wide section).
export const SINGLETON_IDS = {
  homePage: "homePage",
  siteSettings: "siteSettings",
  servicesIndex: "servicesIndex",
  caseStudiesIndex: "caseStudiesIndex",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
export type SingletonId = (typeof SINGLETON_IDS)[keyof typeof SINGLETON_IDS];
