import { defineField, defineType } from "sanity";

export default defineType({
  name: "caseStudy",
  title: "Case study",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "story", title: "Story rows" },
    { name: "publish", title: "Publishing" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Creator name",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role / category",
      type: "string",
      group: "content",
      description: "e.g. \"Design creator\", \"Tech & AI authority\".",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Bio sentence",
      type: "text",
      rows: 3,
      group: "content",
      description: "One-sentence bio used by Person JSON-LD.",
    }),
    defineField({
      name: "cardImage",
      title: "Card image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "title",
      title: "Detail page H1",
      type: "accentHeading",
      group: "content",
      description: "e.g. \"From 12k subs to 412k, on his own terms.\"",
    }),
    defineField({
      name: "stats",
      title: "Stat blocks",
      type: "array",
      group: "content",
      of: [{ type: "caseStudyStat" }],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "rows",
      title: "Story rows",
      type: "array",
      group: "story",
      of: [{ type: "storyRow" }],
    }),
    defineField({
      name: "ctaHook",
      title: "Bottom CTA hook line",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "publish",
    }),
    defineField({
      name: "comingSoon",
      title: "Coming soon?",
      type: "boolean",
      group: "publish",
      initialValue: false,
      description:
        "Show on the case-studies index as un-clickable with a \"Coming soon\" badge.",
    }),
    defineField({
      name: "published",
      title: "Published?",
      type: "boolean",
      group: "publish",
      initialValue: true,
      description: "Untick to hide entirely from the live site.",
    }),
  ],
  preview: {
    select: {
      name: "name",
      role: "role",
      comingSoon: "comingSoon",
      published: "published",
      media: "cardImage",
    },
    prepare: ({ name, role, comingSoon, published, media }) => {
      const flags: string[] = [];
      if (comingSoon) flags.push("COMING SOON");
      if (!published) flags.push("HIDDEN");
      const subtitle = flags.length ? `${role} · ${flags.join(" · ")}` : role;
      return { title: name, subtitle, media };
    },
  },
});
