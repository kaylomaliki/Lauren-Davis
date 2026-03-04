import { defineField, defineType } from "sanity";

export default defineType({
  name: "navigation",
  title: "Navigation",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Navigation Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "href",
            },
          },
        },
      ],
    }),
  ],
});

