import { defineField, defineType } from "sanity";

export default defineType({
  name: "serviceMetric",
  title: "Service metric",
  type: "object",
  fields: [
    defineField({
      name: "num",
      title: "Number / value",
      type: "string",
      description: "e.g. \"+58%\" or \"3 – 5\"",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "context",
      title: "Context",
      type: "string",
      description: "Optional sub-line explaining the number.",
    }),
  ],
  preview: {
    select: { num: "num", label: "label" },
    prepare: ({ num, label }) => ({ title: `${num} — ${label}` }),
  },
});
