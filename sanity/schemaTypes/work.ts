import { defineArrayMember, defineField, defineType } from "sanity";

const TAG_OPTIONS = [
  { title: "Commercial", value: "commercial" },
  { title: "Editorial", value: "editorial" },
  { title: "Fashion", value: "fashion" },
  { title: "Music", value: "music" },
  { title: "Press Photos", value: "press photos" },
] as const;

export default defineType({
  name: "work",
  title: "Work",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Title for this work item",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      description:
        "Add images with an optional per-image title. Drag items by the handle to change order.",
      of: [
        defineArrayMember({
          type: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "title",
              title: "Image Title",
              type: "string",
            }),
          ],
          preview: {
            select: {
              title: "title",
              media: "asset",
            },
            prepare({ title, media }) {
              return {
                title: title || "Untitled image",
                media,
              };
            },
          },
        }),
      ],
      options: {
        layout: "list",
        sortable: true,
      },
    }),
    defineField({
      name: "tag",
      title: "Tag",
      type: "string",
      options: {
        list: [...TAG_OPTIONS],
        layout: "dropdown",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "images.0",
    },
    prepare({ title, media }) {
      return {
        title: title || "Work",
        media,
      };
    },
  },
});
