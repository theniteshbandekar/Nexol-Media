import { defineField, defineType } from "sanity";

export default defineType({
  name: "workSample",
  title: "Work sample",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Shown on the placeholder card.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Image (optional)",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Alt text" }),
      ],
    }),
    defineField({
      name: "caseStudy",
      title: "Related case study",
      description:
        "Optional — if set, the card links to this case study on the live site.",
      type: "reference",
      to: [{ type: "caseStudy" }],
    }),
  ],
  preview: { select: { title: "label" } },
});
