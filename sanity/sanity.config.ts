import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import globalSettings from "./schemaTypes/globalSettings";
import homepage from "./schemaTypes/homepage";
import work from "./schemaTypes/work";

/**
 * Sanity Studio Configuration
 *
 * This configures the Sanity Studio admin interface.
 * Add or remove schema types in the `types` array below.
 *
 * To add a new content type:
 * 1. Create a new schema file in ./schemaTypes/
 * 2. Import it above
 * 3. Add it to the types array below
 */
export default defineConfig({
  name: "default",
  title: "Content Studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  apiVersion: "2024-01-01",
  useCdn: true,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Homepage")
              .id("homepage")
              .child(
                S.document()
                  .schemaType("homepage")
                  .documentId("homepage")
              ),
            ...S.documentTypeListItems().filter(
              (listItem) => listItem.getId() !== "homepage"
            ),
          ]),
    }),
  ],
  schema: {
    types: [globalSettings, homepage, work],
  },
});
