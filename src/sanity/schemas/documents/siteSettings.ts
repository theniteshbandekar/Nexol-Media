import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "nav", title: "Navigation", default: true },
    { name: "footer", title: "Footer" },
    { name: "visibility", title: "Route visibility" },
  ],
  fields: [
    // ---- NAV ----
    defineField({
      name: "primaryNav",
      title: "Primary nav items",
      type: "array",
      group: "nav",
      of: [{ type: "navItem" }],
      validation: (r) => r.min(1).max(8),
    }),
    defineField({
      name: "headerCtaLabel",
      title: "Header CTA label",
      type: "string",
      group: "nav",
      initialValue: "Book a Call",
    }),
    defineField({
      name: "headerCtaHref",
      title: "Header CTA href",
      type: "string",
      group: "nav",
      initialValue: "/contact#book",
    }),

    // ---- FOOTER ----
    defineField({
      name: "footerTagline",
      title: "Brand tagline (footer)",
      type: "text",
      rows: 2,
      group: "footer",
    }),
    defineField({
      name: "footerServices",
      title: "Footer · Services column",
      type: "array",
      group: "footer",
      of: [{ type: "footerLink" }],
    }),
    defineField({
      name: "footerCompany",
      title: "Footer · Company column",
      type: "array",
      group: "footer",
      of: [{ type: "footerLink" }],
    }),
    defineField({
      name: "footerConnect",
      title: "Footer · Connect column",
      type: "array",
      group: "footer",
      of: [{ type: "footerLink" }],
    }),
    defineField({
      name: "footerLocation",
      title: "Footer · Location line",
      type: "string",
      group: "footer",
      initialValue: "Mumbai · Worldwide",
    }),
    defineField({
      name: "footerRights",
      title: "Footer · Rights line",
      type: "string",
      group: "footer",
      initialValue: "All rights reserved",
    }),

    // ---- ROUTE VISIBILITY ----
    defineField({
      name: "routeVisibility",
      title: "Route visibility flags",
      type: "object",
      group: "visibility",
      description:
        "Untick any of these to temporarily hide that section of the live site. The corresponding nav link also disappears and the URLs drop out of the sitemap.",
      fields: [
        defineField({
          name: "blog",
          title: "Blog visible?",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "caseStudies",
          title: "Case studies visible?",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "services",
          title: "Services visible?",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "about",
          title: "About visible?",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "contact",
          title: "Contact visible?",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
