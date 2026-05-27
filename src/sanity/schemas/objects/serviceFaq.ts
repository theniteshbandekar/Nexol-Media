import { defineField, defineType } from "sanity";

export default defineType({
  name: "serviceFaq",
  title: "FAQ entry",
  type: "object",
  fields: [
    defineField({
      name: "q",
      title: "Question",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "a",
      title: "Answer",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "q" } },
});
