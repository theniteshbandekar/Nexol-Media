import { defineField, defineType } from "sanity";

export default defineType({
  name: "processStep",
  title: "Process step",
  type: "object",
  fields: [
    defineField({
      name: "num",
      title: "Number",
      type: "string",
      description: "e.g. \"01\"",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "week",
      title: "Week / day label",
      type: "string",
      description: "e.g. \"Week 01\" or \"Day 60\"",
      validation: (r) => r.required(),
    }),
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
  ],
  preview: { select: { num: "num", title: "title", subtitle: "week" } },
});
