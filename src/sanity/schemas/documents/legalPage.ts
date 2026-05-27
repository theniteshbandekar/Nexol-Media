import { defineField, defineType } from "sanity";

export default defineType({
  name: "legalPage",
  title: "Legal page",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      title: "Page",
      type: "string",
      options: {
        list: [
          { title: "Privacy policy", value: "privacy" },
          { title: "Terms of service", value: "terms" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
      description:
        "Which legal page this document drives. Each kind should exist exactly once.",
    }),
    defineField({
      name: "title",
      title: "Page title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro paragraph",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "datetime",
    }),
  ],
  preview: {
    select: { title: "title", kind: "kind", lastUpdated: "lastUpdated" },
    prepare: ({ title, kind, lastUpdated }) => ({
      title: title ?? kind,
      subtitle: lastUpdated ? `Updated ${lastUpdated.slice(0, 10)}` : undefined,
    }),
  },
});
