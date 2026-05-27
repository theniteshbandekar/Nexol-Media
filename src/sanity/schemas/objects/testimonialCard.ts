import { defineField, defineType } from "sanity";

export default defineType({
  name: "testimonialCard",
  title: "Testimonial card",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Card type",
      type: "string",
      options: {
        list: [
          { title: "Text quote", value: "text" },
          { title: "Video card", value: "video" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "span",
      title: "Grid span",
      type: "number",
      description: "1 (small), 2, 3 (medium), or 4 (large) — bento span.",
      options: { list: [1, 2, 3, 4] },
      validation: (r) => r.required(),
    }),
    // Text card fields
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      hidden: ({ parent }) => parent?.type !== "text",
    }),
    defineField({
      name: "featured",
      title: "Featured text card?",
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }) => parent?.type !== "text",
    }),
    // Video card fields
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        list: [
          { title: "Instagram", value: "instagram" },
          { title: "YouTube", value: "youtube" },
        ],
      },
      hidden: ({ parent }) => parent?.type !== "video",
    }),
    defineField({
      name: "badgeLabel",
      title: "Badge label",
      type: "string",
      description: "e.g. \"Reel\" or \"Video\".",
      hidden: ({ parent }) => parent?.type !== "video",
    }),
    defineField({
      name: "href",
      title: "Link (optional)",
      type: "string",
      description:
        "Where the video card links to — e.g. \"/case-studies/adrien-ninet\".",
      hidden: ({ parent }) => parent?.type !== "video",
    }),
    // Shared
    defineField({
      name: "name",
      title: "Person name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role / context",
      type: "string",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { name: "name", role: "role", type: "type" },
    prepare: ({ name, role, type }) => ({
      title: `${name} (${type})`,
      subtitle: role,
    }),
  },
});
