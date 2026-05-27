import { defineField, defineType } from "sanity";

export default defineType({
  name: "accentHeading",
  title: "Accent heading",
  type: "object",
  fields: [
    defineField({
      name: "before",
      title: "Before accent",
      type: "string",
      description: "Text before the lime-accented phrase. Required.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "accent",
      title: "Accent phrase",
      type: "string",
      description: "Optional lime-highlighted phrase.",
    }),
    defineField({
      name: "after",
      title: "After accent",
      type: "string",
      description: "Text after the lime-accented phrase. Often ends with a period.",
    }),
  ],
  preview: {
    select: { before: "before", accent: "accent", after: "after" },
    prepare: ({ before, accent, after }) => ({
      title: [before, accent, after].filter(Boolean).join(""),
    }),
  },
});
