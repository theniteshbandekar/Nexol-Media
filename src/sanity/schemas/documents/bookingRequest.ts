import { defineField, defineType } from "sanity";

export default defineType({
  name: "bookingRequest",
  title: "Booking",
  type: "document",
  fields: [
    defineField({
      name: "bookedAt",
      title: "Booked at",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "startsAt",
      title: "Starts at",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "endsAt",
      title: "Ends at",
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
      name: "services",
      title: "Services of interest",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 4,
      readOnly: true,
    }),
    defineField({
      name: "meetLink",
      title: "Google Meet link",
      type: "url",
      readOnly: true,
    }),
    defineField({
      name: "eventId",
      title: "Google Calendar event ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Confirmed", value: "confirmed" },
          { title: "Cancelled", value: "cancelled" },
          { title: "No-show", value: "noshow" },
          { title: "Completed", value: "completed" },
        ],
        layout: "radio",
      },
      initialValue: "confirmed",
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
      title: "Soonest first",
      name: "startsAtAsc",
      by: [{ field: "startsAt", direction: "asc" }],
    },
    {
      title: "Newest booking first",
      name: "bookedAtDesc",
      by: [{ field: "bookedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      email: "email",
      startsAt: "startsAt",
      status: "status",
    },
    prepare: ({ name, email, startsAt, status }) => ({
      title: name ? `${name} (${email})` : email,
      subtitle: [
        status?.toUpperCase(),
        startsAt
          ? new Date(startsAt).toLocaleString("en-GB", {
              timeZone: "Asia/Kolkata",
              dateStyle: "medium",
              timeStyle: "short",
            })
          : undefined,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
