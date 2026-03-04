import { defineField, defineType } from "sanity";

/**
 * Generic Page schema - for static pages like About, Contact, etc.
 */
export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Meta description for SEO",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike" },
            ],
            annotations: [
              {
                title: "Link",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                    validation: (Rule: any) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                  {
                    title: "Open in new tab",
                    name: "blank",
                    type: "boolean",
                    description: "Check this to make the link open in a new browser tab",
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          fields: [
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
    },
    prepare({ title, slug }) {
      return {
        title,
        subtitle: slug ? `/${slug}` : "",
      };
    },
  },
});

