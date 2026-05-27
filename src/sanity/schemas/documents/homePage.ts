import { defineField, defineType } from "sanity";

export default defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "vsl", title: "VSL" },
    { name: "stats", title: "Stats" },
    { name: "testimonials", title: "Testimonials" },
    { name: "hook", title: "Hook" },
  ],
  fields: [
    // ---- HERO ----
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "hero",
      fields: [
        defineField({
          name: "h1",
          title: "Headline",
          type: "accentHeading",
          description:
            "e.g. before: \"Polished Videos. \", accent: \"Real Growth.\"",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "tagline",
          title: "Tagline",
          type: "text",
          rows: 2,
          description:
            "Sub-headline below the H1 (e.g. \"Editing, scripts & distribution for Tech, AI & Design creators.\").",
        }),
        defineField({
          name: "scrollCue",
          title: "Scroll cue text",
          type: "string",
          initialValue: "Scroll ↓",
        }),
      ],
    }),

    // ---- VSL ----
    defineField({
      name: "vsl",
      title: "VSL section",
      type: "object",
      group: "vsl",
      fields: [
        defineField({
          name: "title",
          title: "Video title",
          type: "string",
        }),
        defineField({
          name: "duration",
          title: "Duration label",
          type: "string",
          description: "e.g. \"02:14\"",
        }),
        defineField({
          name: "videoUrl",
          title: "Video URL (optional)",
          type: "url",
          description: "If set, the play button will deep-link here.",
        }),
        defineField({
          name: "posterImage",
          title: "Poster image",
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt" }],
        }),
      ],
    }),

    // ---- STATS ----
    defineField({
      name: "stats",
      title: "Stats (3 blocks)",
      type: "array",
      group: "stats",
      of: [{ type: "statBlock" }],
      validation: (r) => r.min(3).max(3),
    }),

    // ---- TESTIMONIALS ----
    defineField({
      name: "testimonials",
      title: "Testimonial cards",
      type: "array",
      group: "testimonials",
      of: [{ type: "testimonialCard" }],
      validation: (r) => r.min(2).max(8),
    }),

    // ---- HOOK ----
    defineField({
      name: "hook",
      title: "Hook section",
      type: "object",
      group: "hook",
      fields: [
        defineField({
          name: "h2",
          title: "Hook headline",
          type: "accentHeading",
        }),
        defineField({
          name: "secondaryLinks",
          title: "Secondary links",
          type: "array",
          of: [{ type: "secondaryLink" }],
          validation: (r) => r.max(4),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
