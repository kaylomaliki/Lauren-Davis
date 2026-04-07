"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import OptimizedImage from "@/components/images/OptimizedImage";
import { getImageDimensions } from "@/lib/image";

interface FullscreenSlideshowProps {
  images: SanityImageSource[];
}

export default function FullscreenSlideshow({ images }: FullscreenSlideshowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  if (!images?.length) return null;

  return (
    <div
      className="relative z-0 h-[100vh] w-[100vw] overflow-hidden bg-[var(--color-background)]"
      aria-label="Fullscreen slideshow"
    >
      {/* Left half: previous slide */}
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-0 top-0 z-10 h-full w-1/2 cursor-default focus:outline-none"
        aria-label="Previous slide"
      />
      {/* Right half: next slide */}
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-0 top-0 z-10 h-full w-1/2 cursor-default focus:outline-none"
        aria-label="Next slide"
      />

      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full">
          {images.map((image, index) => {
            const dimensions = getImageDimensions(image);
            const hasDimensions =
              dimensions.width != null && dimensions.height != null;
            return (
              <div
                key={index}
                className="relative min-h-0 min-w-0 flex-[0_0_100%]"
              >
                {hasDimensions ? (
                  <div className="relative h-full w-full">
                    <OptimizedImage
                      image={image}
                      alt={`Slide ${index + 1}`}
                      fill
                      sizes="100vw"
                      objectFit="cover"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full bg-[var(--placeholder-color,#f3f4f6)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
