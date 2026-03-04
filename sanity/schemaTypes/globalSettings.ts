import { defineField, defineType } from "sanity";

export default defineType({
  name: "globalSettings",
  title: "Global Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
    }),
    defineField({
      name: "siteDescription",
      title: "Site Description",
      type: "text",
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default OG Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Global Settings",
      };
    },
  },
});

