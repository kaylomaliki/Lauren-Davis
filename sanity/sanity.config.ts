import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import homepage from "./schemaTypes/homepage";
import post from "./schemaTypes/post";
import page from "./schemaTypes/page";
import globalSettings from "./schemaTypes/globalSettings";
import imageWithAlt from "./schemaTypes/imageWithAlt";
import navigation from "./schemaTypes/navigation";

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
  plugins: [structureTool()],
  schema: {
    types: [
      homepage,
      post,
      page,
      globalSettings,
      imageWithAlt,
      navigation,
    ],
  },
});
