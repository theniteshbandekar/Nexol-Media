import { defineField, defineType } from "sanity";

export default defineType({
  name: "storyBody",
  title: "Story body",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Paragraph",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bold",
      title: "Bold trailing sentence",
      type: "string",
      description: "Optional sentence rendered in bold at the end.",
    }),
  ],
});
