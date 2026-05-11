"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import OptimizedImage from "@/components/images/OptimizedImage";
import ImageMagnifier from "@/components/ImageMagnifier";
import useScrollCycle, {
  SCROLL_VH_PER_SLIDE,
  TOTAL_CYCLES,
} from "@/hooks/useScrollCycle";
import { useActiveSlide } from "@/contexts/ActiveSlideContext";

export interface WorkMagnifierSlide {
  id: string;
  title?: string;
  image: SanityImageSource;
}

interface WorkProjectMagnifierViewProps {
  slides: WorkMagnifierSlide[];
  startIndex: number;
  onClose: () => void;
}

const TRANSITION_MS = 0;

export default function WorkProjectMagnifierView({
  slides,
  startIndex,
  onClose,
}: WorkProjectMagnifierViewProps) {
  const { activeIndex, slideProgress, scrollToSlide } = useScrollCycle(slides.length);
  const { setActiveTitle, setSlideProgress, setOverviewSlides } = useActiveSlide();

  useLayoutEffect(() => {
    scrollToSlide(startIndex);
  }, [scrollToSlide, startIndex]);

  useEffect(() => {
    const title = slides[activeIndex]?.title?.trim() || "";
    setActiveTitle(title);
  }, [activeIndex, slides, setActiveTitle]);

  useEffect(() => {
    setSlideProgress(slideProgress);
  }, [slideProgress, setSlideProgress]);

  useEffect(() => {
    if (slides.length === 0) {
      setOverviewSlides(0, 0);
      return;
    }
    setOverviewSlides(activeIndex, slides.length);
    return () => setOverviewSlides(0, 0);
  }, [activeIndex, slides.length, setOverviewSlides]);

  const scrollHeightVh = useMemo(
    () => TOTAL_CYCLES * slides.length * SCROLL_VH_PER_SLIDE + 100,
    [slides.length]
  );

  if (slides.length === 0) {
    return null;
  }

  const active = slides[activeIndex];

  return (
    <>
      {active && (
        <ImageMagnifier
          image={active.image}
          alt={active.title ?? "Work image"}
          onClose={onClose}
        />
      )}
      <div
        className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: "var(--color-background)",
          pointerEvents: "none",
          cursor: "default",
        }}
      >
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.id}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{
                opacity: isActive ? 1 : 0,
                transition: `opacity ${TRANSITION_MS}ms ease`,
              }}
            >
              <div
                className="relative"
                style={{
                  height: "60vh",
                  width: "calc(100vw - 2 * var(--padding-base))",
                }}
              >
                <OptimizedImage
                  image={slide.image}
                  alt={slide.title ?? "Work image"}
                  fill
                  priority={index === 0}
                  sizes="calc(100vw - 2 * var(--padding-base))"
                  objectFit="contain"
                  className="object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="pointer-events-none relative z-[1]"
        style={{ height: `${scrollHeightVh}vh` }}
        aria-hidden
      />
    </>
  );
}
