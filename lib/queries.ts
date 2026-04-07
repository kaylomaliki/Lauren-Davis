import { sanityClient } from "./sanity.client";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

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

/** Singleton document `homepage` — one image for the site homepage */
export interface Homepage {
  _id: string;
  image?: SanityImageSource;
}

export type WorkTag = "commercial" | "editorial" | "fashion" | "music" | "press photos";

export interface WorkImageItem {
  image?: SanityImageSource;
  title?: string;
}

export interface Work {
  _id: string;
  title?: string;
  images?: WorkImageItem[];
  tag?: WorkTag;
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
 * Homepage singleton — create "Homepage" in Studio (fixed document) and upload the hero image.
 */
export async function getHomepage(): Promise<Homepage | null> {
  try {
    const query = `*[_type == "homepage"][0]{
      _id,
      image {
        ...,
        asset-> {
          _id,
          _ref,
          metadata
        }
      }
    }`;
    return await sanityClient.fetch<Homepage | null>(query);
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}

/**
 * Fetch all Work documents
 */
export async function getAllWork(): Promise<Work[]> {
  try {
    const query = `*[_type == "work"]{
      _id,
      title,
      "images": images[] {
        "title": coalesce(title, image.title),
        "image": coalesce(image, @) {
          ...,
          "asset": asset-> {
            _id,
            _ref,
            metadata
          }
        }
      },
      tag
    }`;
    return await sanityClient.fetch<Work[]>(query);
  } catch (error) {
    console.error("Error fetching work:", error);
    return [];
  }
}
