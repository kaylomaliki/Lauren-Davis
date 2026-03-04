import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

/**
 * Image URL Builder
 * 
 * Creates optimized image URLs from Sanity image sources.
 * Used for generating responsive, optimized images.
 */

const builder = imageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
});

/**
 * Generate an optimized image URL from a Sanity image source
 * 
 * @param source - Sanity image source (from a document field)
 * @returns Image URL builder with chainable methods
 * 
 * @example
 * urlForImage(image).width(800).height(600).url()
 */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max");
}

export interface ImageDimensions {
  width?: number;
  height?: number;
  aspectRatio?: number;
}

/**
 * Extract dimensions from a Sanity image source
 * Useful for Next.js Image component which requires width/height
 * 
 * @param source - Sanity image source
 * @returns Image dimensions object
 */
export function getImageDimensions(source: SanityImageSource): ImageDimensions {
  if (!source || typeof source !== "object") {
    return {};
  }

  const image = source as {
    asset?: {
      _ref?: string;
      metadata?: {
        dimensions?: {
          width?: number;
          height?: number;
          aspectRatio?: number;
        };
      };
    };
  };

  const dimensions = image.asset?.metadata?.dimensions;

  if (!dimensions) {
    return {};
  }

  return {
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio: dimensions.aspectRatio,
  };
}
