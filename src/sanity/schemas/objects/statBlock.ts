import { defineField, defineType } from "sanity";

export default defineType({
  name: "statBlock",
  title: "Stat block (home)",
  type: "object",
  fields: [
    defineField({
      name: "target",
      title: "Target number",
      type: "number",
      description: "Integer the counter animates to.",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "suffix",
      title: "Suffix",
      type: "string",
      description: "e.g. \"M\" for millions or \"+\" — appended to the number.",
    }),
    defineField({
      name: "comma",
      title: "Use thousands separator?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { target: "target", suffix: "suffix", label: "label" },
    prepare: ({ target, suffix, label }) => ({
      title: `${target ?? "?"}${suffix ?? ""} — ${label ?? ""}`,
    }),
  },
});
