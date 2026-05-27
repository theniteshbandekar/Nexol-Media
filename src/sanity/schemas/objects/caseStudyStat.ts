import { defineField, defineType } from "sanity";

export default defineType({
  name: "caseStudyStat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({
      name: "num",
      title: "Number / value",
      type: "string",
      description: "e.g. \"+412K\", \"3.1M\", \"8 wks\"",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { num: "num", label: "label" },
    prepare: ({ num, label }) => ({ title: `${num} — ${label}` }),
  },
});
