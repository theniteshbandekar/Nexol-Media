import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "blogPost",
  title: "Blog post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Meta" },
    { name: "publish", title: "Publishing" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "dek",
      title: "Dek / subtitle",
      type: "text",
      rows: 3,
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "meta",
      options: {
        list: [
          "Growth",
          "Editing",
          "AI tools",
          "Distribution",
          "Behind the scenes",
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "meta",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "meta",
      to: [{ type: "blogAuthor" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "meta",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "modifiedAt",
      title: "Last modified at",
      type: "datetime",
      group: "meta",
    }),
    defineField({
      name: "readTimeMinutes",
      title: "Read time (minutes)",
      type: "number",
      group: "meta",
      validation: (r) => r.required().positive().integer(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "heroLabel",
      title: "Hero placeholder label",
      type: "string",
      group: "content",
      description:
        "Fallback label shown on the hero placeholder when no image is uploaded.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        // Standard portable text with custom h2 (numbered) + styles
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "H2 (numbered)", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Pullquote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Drop cap (first paragraph)", value: "dropCap" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                ],
              },
            ],
          },
        }),
        // Figure / image block
        defineArrayMember({
          name: "figure",
          type: "object",
          title: "Figure",
          fields: [
            defineField({
              name: "image",
              type: "image",
              title: "Image",
              options: { hotspot: true },
              fields: [{ name: "alt", type: "string", title: "Alt" }],
            }),
            defineField({
              name: "placeholderLabel",
              type: "string",
              title: "Placeholder label",
              description: "Shown when no image is uploaded.",
            }),
            defineField({
              name: "caption",
              type: "string",
              title: "Caption",
            }),
          ],
        }),
        // Pull quote (alternative to blockquote style — more structured)
        defineArrayMember({
          name: "pullquote",
          type: "object",
          title: "Pull quote",
          fields: [
            defineField({
              name: "text",
              type: "text",
              rows: 3,
              title: "Quote",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "by",
              type: "string",
              title: "Attribution",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Featured?",
      type: "boolean",
      group: "publish",
      initialValue: false,
      description: "Pin to the featured slot on the blog index.",
    }),
    defineField({
      name: "published",
      title: "Published?",
      type: "boolean",
      group: "publish",
      initialValue: true,
      description: "Untick to hide from the live site without deleting.",
    }),
  ],
  orderings: [
    {
      title: "Published — newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      published: "published",
      media: "heroImage",
    },
    prepare: ({ title, category, published, media }) => ({
      title,
      subtitle: `${category}${published ? "" : " · DRAFT"}`,
      media,
    }),
  },
});
