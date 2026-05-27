import { defineField, defineType } from "sanity";

export default defineType({
  name: "footerLink",
  title: "Footer link",
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
      description: "Internal path or full URL.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "external",
      title: "External?",
      type: "boolean",
      initialValue: false,
      description:
        "If true, the link opens in a new tab with rel=\"noopener noreferrer\".",
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});
