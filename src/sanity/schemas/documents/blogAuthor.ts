import { defineField, defineType } from "sanity";

export default defineType({
  name: "blogAuthor",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "initials",
      title: "Initials",
      type: "string",
      description: "2-letter avatar fallback (e.g. \"NB\").",
      validation: (r) => r.required().max(3),
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
  ],
  preview: {
    select: { name: "name", role: "role", media: "avatar" },
    prepare: ({ name, role, media }) => ({ title: name, subtitle: role, media }),
  },
});
