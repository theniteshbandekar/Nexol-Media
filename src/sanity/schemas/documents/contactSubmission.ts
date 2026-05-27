import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactSubmission",
  title: "Contact submission",
  type: "document",
  fields: [
    defineField({
      name: "submittedAt",
      title: "Submitted at",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "channelUrl",
      title: "Channel URL",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "niche",
      title: "Niche",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "services",
      title: "Services of interest",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
    defineField({
      name: "monthlyVolume",
      title: "Monthly upload volume",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 6,
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Replied", value: "replied" },
          { title: "Closed", value: "closed" },
          { title: "Spam", value: "spam" },
        ],
        layout: "radio",
      },
      initialValue: "new",
    }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 4,
      description: "Free-form notes — not visible on the site.",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      email: "email",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare: ({ name, email, status, submittedAt }) => ({
      title: name ? `${name} (${email})` : email,
      subtitle: [status?.toUpperCase(), submittedAt?.slice(0, 10)]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
