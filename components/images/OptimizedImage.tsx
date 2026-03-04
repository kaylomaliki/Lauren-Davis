"use client";

import { useCallback, useRef, useState, useMemo } from "react";
import Image from "next/image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlForImage } from "@/lib/image";

/**
 * OptimizedImage Component
 * 
 * A production-grade, universal image component for Sanity images in Next.js 14.
 * Uses Next.js Image Optimization with custom Sanity CDN loader for automatic
 * responsive sizing, modern formats (AVIF/WebP), and optimal performance.
 * 
 * Features:
 * - Full Next.js Image Optimization (automatic srcsets, AVIF/WebP)
 * - CSS-based gradient placeholder with smooth fade transition
 * - Automatic responsive image sizing based on sizes prop
 * - TypeScript-first with strong typing
 * 
 * IMPORTANT: The `sizes` prop is critical for performance! Without it, Next.js
 * only generates a small source set. With it, a much larger, optimized source set
 * is generated, dramatically improving performance (can reduce file size by 9x).
 * 
 * For remote images, `width` and `height` are used to infer aspect ratio and
 * prevent layout shift - they don't determine the rendered size. You can provide
 * smaller dimensions if you know the maximum rendered width for better optimization.
 * 
 * @example
 * // Fill mode (responsive container) - sizes is required!
 * <OptimizedImage
 *   image={sanityImage}
 *   alt="Description"
 *   fill
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   className="object-cover"
 * />
 * 
 * @example
 * // Fixed dimensions - sizes is automatically calculated but can be overridden
 * <OptimizedImage
 *   image={sanityImage}
 *   alt="Description"
 *   width={800}
 *   height={600}
 *   sizes="(max-width: 768px) 100vw, 800px"
 *   priority
 * />
 */
export interface OptimizedImageProps {
  /** Sanity image source (required) */
  image: SanityImageSource;
  
  /** Alt text for accessibility (required) */
  alt: string;
  
  /** CSS class name */
  className?: string;
  
  /** Use fill mode (requires parent with position: relative) */
  fill?: boolean;
  
  /** 
   * Fixed width (required if not using fill)
   * 
   * For remote images, this doesn't determine the rendered size - it's used to
   * infer the aspect ratio and prevent layout shift. You can provide smaller
   * dimensions if you know the maximum rendered width for better optimization.
   */
  width?: number;
  
  /** 
   * Fixed height (required if not using fill)
   * 
   * For remote images, this doesn't determine the rendered size - it's used to
   * infer the aspect ratio and prevent layout shift. Should match the aspect
   * ratio of the actual image for best results.
   */
  height?: number;
  
  /** Priority loading (preloads image) */
  priority?: boolean;
  
  /** 
   * Loading strategy override
   * 
   * Note: Use `priority` prop instead of `loading="eager"` for above-the-fold images.
   * Setting loading to "eager" can hurt performance. The priority prop automatically
   * handles eager loading when needed.
   */
  loading?: "lazy" | "eager";
  
  /** 
   * Responsive sizes string - CRITICAL for performance!
   * 
   * This prop is used by the browser to determine which image size to download
   * from the automatically generated source set. Without it, only a small source
   * set is generated, leading to much larger file downloads.
   * 
   * For fixed dimensions: If not provided, a default is calculated based on width.
   * For fill mode: Must be provided for optimal performance.
   * 
   * Use a responsive image linter tool to calculate the perfect sizes value.
   * Example: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
   */
  sizes?: string;
  
  /** Disable Next.js optimization (not recommended) */
  unoptimized?: boolean;
  
  /** Object fit style */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  
  /** Object position style */
  objectPosition?: string;
  
  /** Decoding strategy */
  decoding?: "async" | "auto" | "sync";
  
  /** Fetch priority */
  fetchPriority?: "auto" | "high" | "low";
  
  /** Callback fired when image loads successfully */
  onLoad?: (data: {
    intrinsicWidth: number;
    intrinsicHeight: number;
    renderedWidth: number;
    renderedHeight: number;
  }) => void;
  
  /** Callback fired on load error */
  onError?: () => void;
}

/**
 * Extract Sanity asset reference from image source
 */
function getSanityAssetRef(source: SanityImageSource): string | null {
  if (!source || typeof source !== "object") return null;
  
  const image = source as {
    asset?: {
      _ref?: string;
      _id?: string;
    };
  };
  
  return image.asset?._ref || image.asset?._id || null;
}

export default function OptimizedImage({
  image,
  alt,
  className,
  fill = false,
  width,
  height,
  priority = false,
  loading,
  sizes,
  unoptimized = false,
  objectFit,
  objectPosition,
  decoding,
  fetchPriority,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Track when image has loaded to fade out placeholder
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Extract Sanity asset ref to check validity
  const assetRef = getSanityAssetRef(image);
  
  // Generate full image URL from Sanity source
  const src = useMemo(() => {
    if (!image) return null;
    try {
      return urlForImage(image).url();
    } catch {
      return null;
    }
  }, [image]);
  
  // Generate blurred placeholder image URL (very small, very low quality for fast loading)
  const blurPlaceholderUrl = useMemo(() => {
    if (!image) return null;
    try {
      return urlForImage(image)
        .width(10)
        .height(10)
        .quality(5)
        .fit("crop")
        .url();
    } catch {
      return null;
    }
  }, [image]);
  
  // Handle image load
  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      
      // Mark image as loaded to fade out placeholder
      setImageLoaded(true);
      
      // Calculate rendered dimensions by measuring the container
      let renderedWidth = naturalWidth;
      let renderedHeight = naturalHeight;
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        renderedWidth = rect.width;
        renderedHeight = rect.height;
      }
      
      onLoad?.({
        intrinsicWidth: naturalWidth,
        intrinsicHeight: naturalHeight,
        renderedWidth,
        renderedHeight,
      });
    },
    [onLoad]
  );
  
  // Early return after all hooks are defined
  if (!src || !assetRef) {
    console.warn("OptimizedImage: Invalid image source, missing asset ref or unable to generate URL");
    return null;
  }
  
  // Determine loading strategy
  // Note: Don't use loading="eager" - use priority prop instead
  const loadingStrategy = loading || (priority ? "eager" : "lazy");
  const decodingStrategy = decoding || "async";
  const fetchPriorityStrategy = fetchPriority || (priority ? "high" : "auto");
  
  // Calculate smart default sizes for fixed dimensions if not provided
  // This ensures a larger source set is generated for better optimization
  const defaultSizes = useMemo(() => {
    if (sizes) return sizes; // Use provided sizes
    if (fill) return "100vw"; // Fill mode default
    
    // For fixed dimensions, calculate a responsive default based on width
    // This assumes the image will be responsive up to its specified width
    if (width) {
      // If width is small, assume it's full width on mobile
      if (width <= 768) {
        return `(max-width: ${width}px) 100vw, ${width}px`;
      }
      // For larger images, assume they scale down on mobile
      return `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`;
    }
    
    return "100vw"; // Fallback
  }, [sizes, fill, width]);
  
  // Dev-only warning for missing sizes in fill mode
  if (process.env.NODE_ENV !== "production" && fill && !sizes) {
    console.warn(
      "OptimizedImage: The 'sizes' prop is missing in fill mode. " +
      "This can dramatically impact performance. Provide a sizes prop for optimal image optimization. " +
      "Example: sizes='(max-width: 768px) 100vw, 50vw'"
    );
  }
  
  // Build style object
  // For fill mode: position is automatically absolute (cannot be overridden), so we only set zIndex
  // For fixed dimensions: we set position relative to ensure proper layering above placeholder
  const imageStyle: React.CSSProperties = {
    zIndex: 2,
  };
  if (!fill) {
    imageStyle.position = "relative";
  }
  if (objectFit) imageStyle.objectFit = objectFit;
  if (objectPosition) imageStyle.objectPosition = objectPosition;
  
  // CSS placeholder styles with blurred image
  // Background color shows first, then blur image overlays when loaded
  // Use "contain" backgroundSize when objectFit is "contain" to match image behavior
  const placeholderStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "var(--placeholder-color, #f3f4f6)", // Shows immediately, falls back to gray
    backgroundImage: blurPlaceholderUrl ? `url(${blurPlaceholderUrl})` : undefined,
    backgroundSize: objectFit === "contain" ? "contain" : "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: blurPlaceholderUrl ? "blur(20px)" : "none",
    transform: objectFit === "contain" ? "none" : (blurPlaceholderUrl ? "scale(1.1)" : "none"), // Only scale if using cover
    opacity: imageLoaded ? 0 : 1,
    transition: "opacity 0.3s ease-out",
    pointerEvents: "none",
    zIndex: 1,
  };
  
  // Render fill mode
  if (fill) {
    return (
      <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }} className={className}>
        {/* CSS placeholder */}
        <div style={placeholderStyle} aria-hidden="true" />
        {/* Image */}
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={loadingStrategy}
          decoding={decodingStrategy}
          fetchPriority={fetchPriorityStrategy}
          sizes={sizes || "100vw"}
          unoptimized={unoptimized}
          style={imageStyle}
          onLoad={handleLoad}
          onError={onError}
        />
      </div>
    );
  }

  // Render fixed dimensions mode
  if (!width || !height) {
    console.warn("OptimizedImage: Missing width or height for fixed dimensions mode");
    return null;
  }

  // Combine className with responsive defaults for better responsive behavior
  // Add w-full h-auto if not already present for responsive images
  const responsiveClasses = useMemo(() => {
    if (!className) return "w-full h-auto";
    if (className.includes("w-full") || className.includes("h-auto")) return className;
    return `${className} w-full h-auto`;
  }, [className]);

  return (
    <div ref={containerRef} style={{ position: "relative", width, height }}>
      {/* CSS placeholder */}
      <div style={placeholderStyle} aria-hidden="true" />
      {/* Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={loadingStrategy}
        decoding={decodingStrategy}
        fetchPriority={fetchPriorityStrategy}
        sizes={defaultSizes}
        unoptimized={unoptimized}
        style={imageStyle}
        className={responsiveClasses}
        onLoad={handleLoad}
        onError={onError}
      />
    </div>
  );
}
