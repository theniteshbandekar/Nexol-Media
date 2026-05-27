import { defineField, defineType } from "sanity";

export default defineType({
  name: "storyPhoto",
  title: "Story photo",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      title: "Photo type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Placeholder", value: "placeholder" },
        ],
        layout: "radio",
      },
      initialValue: "placeholder",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.kind !== "image",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Accessibility + SEO. Required for image kind.",
        }),
      ],
    }),
    defineField({
      name: "label",
      title: "Placeholder label",
      type: "string",
      description: "Shown as text in the placeholder slot when no image is set.",
      hidden: ({ parent }) => parent?.kind !== "placeholder",
    }),
  ],
});
