import { sanityClient } from "./sanity.client";
import type { PortableTextBlock } from "@portabletext/types";

/**
 * TypeScript types for Sanity content
 * These match the schema definitions in sanity/schemaTypes/
 */

export interface GlobalSettings {
  _id: string;
  siteTitle?: string;
  siteDescription?: string;
  defaultOgImage?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
}

export interface Page {
  _id: string;
  title?: string;
  slug?: {
    current: string;
  };
  description?: string;
  content?: PortableTextBlock[]; // Portable text content (array of blocks)
}

export interface Post {
  _id: string;
  title?: string;
  slug?: {
    current: string;
  };
  description?: string;
  content?: PortableTextBlock[]; // Portable text content (array of blocks)
  featuredImage?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  publishedAt?: string;
}

/**
 * Sanity Data Queries
 * 
 * These functions fetch data from your Sanity CMS.
 * Customize queries based on your schema types.
 */

/**
 * Fetch global site settings
 * Create a document of type "globalSettings" in Sanity Studio
 */
export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  try {
    const query = `*[_type == "globalSettings"][0]`;
    return await sanityClient.fetch<GlobalSettings | null>(query);
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return null;
  }
}

/**
 * Fetch a page by slug
 * Works with "homepage", "page", or any document type with a slug field
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const query = `*[_type in ["homepage", "page"] && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      content
    }`;
    return await sanityClient.fetch<Page | null>(query, { slug });
  } catch (error) {
    console.error(`Error fetching page with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch all posts
 * Useful for blog listings, archives, etc.
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      featuredImage,
      publishedAt
    }`;
    return await sanityClient.fetch<Post[]>(query);
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const query = `*[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      content,
      featuredImage,
      publishedAt
    }`;
    return await sanityClient.fetch<Post | null>(query, { slug });
  } catch (error) {
    console.error(`Error fetching post with slug "${slug}":`, error);
    return null;
  }
}
