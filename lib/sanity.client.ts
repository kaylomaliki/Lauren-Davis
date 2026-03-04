import { createClient } from "@sanity/client";

/**
 * Sanity Client Configuration
 * 
 * This client is used to fetch data from your Sanity CMS.
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SANITY_PROJECT_ID: Your Sanity project ID
 * - NEXT_PUBLIC_SANITY_DATASET: Your dataset name (usually "production")
 * - SANITY_API_READ_TOKEN: API token with read permissions
 * 
 * @see https://www.sanity.io/docs/js-client
 */
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01", // Use a date that matches your Sanity project
  useCdn: true, // Set to false if statically generating pages
  token: process.env.SANITY_API_READ_TOKEN,
});
