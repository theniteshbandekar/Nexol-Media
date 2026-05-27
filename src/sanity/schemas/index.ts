import type { SchemaTypeDefinition } from "sanity";

// Object types
import accentHeading from "./objects/accentHeading";
import caseStudyStat from "./objects/caseStudyStat";
import storyBody from "./objects/storyBody";
import storyPhoto from "./objects/storyPhoto";
import storyRow from "./objects/storyRow";
import deliverable from "./objects/deliverable";
import processStep from "./objects/processStep";
import serviceMetric from "./objects/serviceMetric";
import workSample from "./objects/workSample";
import serviceFaq from "./objects/serviceFaq";
import statBlock from "./objects/statBlock";
import testimonialCard from "./objects/testimonialCard";
import navItem from "./objects/navItem";
import footerLink from "./objects/footerLink";
import secondaryLink from "./objects/secondaryLink";

// Document types
import blogAuthor from "./documents/blogAuthor";
import blogPost from "./documents/blogPost";
import caseStudy from "./documents/caseStudy";
import service from "./documents/service";
import homePage from "./documents/homePage";
import siteSettings from "./documents/siteSettings";
import contactSubmission from "./documents/contactSubmission";
import legalPage from "./documents/legalPage";
import bookingRequest from "./documents/bookingRequest";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Object types first so they can be referenced by documents
  accentHeading,
  caseStudyStat,
  storyBody,
  storyPhoto,
  storyRow,
  deliverable,
  processStep,
  serviceMetric,
  workSample,
  serviceFaq,
  statBlock,
  testimonialCard,
  navItem,
  footerLink,
  secondaryLink,
  // Document types
  blogAuthor,
  blogPost,
  caseStudy,
  service,
  homePage,
  siteSettings,
  contactSubmission,
  legalPage,
  bookingRequest,
];
