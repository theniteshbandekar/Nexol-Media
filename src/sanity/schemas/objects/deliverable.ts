import { defineField, defineType } from "sanity";

export default defineType({
  name: "deliverable",
  title: "Deliverable",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bullets",
      title: "Bullets",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.min(1).max(6),
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});
