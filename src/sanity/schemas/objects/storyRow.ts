import { defineField, defineType } from "sanity";

export default defineType({
  name: "storyRow",
  title: "Story row",
  type: "object",
  fields: [
    defineField({
      name: "num",
      title: "Section number",
      type: "string",
      description: "e.g. \"01 · The brief\"",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "accentHeading",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "storyBody",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "storyPhoto",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Photo right", value: "photo-right" },
          { title: "Photo left", value: "photo-left" },
        ],
        layout: "radio",
      },
      initialValue: "photo-right",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { num: "num", before: "heading.before", accent: "heading.accent" },
    prepare: ({ num, before, accent }) => ({
      title: num,
      subtitle: [before, accent].filter(Boolean).join(""),
    }),
  },
});
