import type { Metadata } from "next";
import { urlForImage } from "./image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface BuildMetadataParams {
  title?: string;
  description?: string;
  image?: SanityImageSource;
  siteTitle?: string;
  siteDescription?: string;
  defaultOgImage?: SanityImageSource;
}

/**
 * SEO Metadata Builder
 * 
 * Generates Next.js Metadata objects for pages.
 * Automatically combines page-specific and site-wide metadata.
 * 
 * @example
 * export async function generateMetadata(): Promise<Metadata> {
 *   return buildMetadata({
 *     title: "About Us",
 *     description: "Learn more about our company",
 *   });
 * }
 */
export function buildMetadata({
  title,
  description,
  image,
  siteTitle = "My Website",
  siteDescription = "A modern website built with Next.js and Sanity",
  defaultOgImage,
}: BuildMetadataParams): Metadata {
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const fullDescription = description || siteDescription;
  const ogImage = image || defaultOgImage;
  const ogImageUrl = ogImage ? urlForImage(ogImage).width(1200).height(630).url() : undefined;

  return {
    title: fullTitle,
    description: fullDescription,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
