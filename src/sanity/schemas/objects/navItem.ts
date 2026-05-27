import { defineField, defineType } from "sanity";

export default defineType({
  name: "navItem",
  title: "Nav item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "href",
      title: "Href",
      type: "string",
      description: "e.g. \"/services\" — internal paths recommended.",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});
