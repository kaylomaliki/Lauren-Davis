import { defineField, defineType } from "sanity";

export default defineType({
  name: "imageWithAlt",
  title: "Image with Alt",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      image: "image",
      alt: "alt",
    },
    prepare({ image, alt }) {
      return {
        title: alt || "Image",
        media: image,
      };
    },
  },
});

