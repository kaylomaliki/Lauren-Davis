"use client";

import { useEffect, useMemo } from "react";
import type { Work } from "@/lib/queries";
import OptimizedImage from "@/components/images/OptimizedImage";
import ImageMagnifier from "@/components/ImageMagnifier";
import useScrollCycle, {
  SCROLL_VH_PER_SLIDE,
  TOTAL_CYCLES,
} from "@/hooks/useScrollCycle";
import { useActiveSlide } from "@/contexts/ActiveSlideContext";

interface OverviewScrollFadeProps {
  works: Work[];
}

const TRANSITION_MS = 0;

export default function OverviewScrollFade({ works }: OverviewScrollFadeProps) {
  const slides = useMemo(
    () =>
      works.flatMap((work) =>
        (work.images ?? []).flatMap((imageItem, imageIndex) => {
          const image = imageItem.image;
          if (image == null) return [];
          return [
            {
              id: `${work._id}-${imageIndex}`,
              title: imageItem.title ?? work.title,
              image,
            },
          ];
        })
      ),
    [works]
  );

  const { activeIndex, slideProgress } = useScrollCycle(slides.length);

  const { setActiveTitle, setSlideProgress, magnifying, setMagnifying } = useActiveSlide();

  useEffect(() => {
    const title = slides[activeIndex]?.title?.trim() || "";
    setActiveTitle(title);
  }, [activeIndex, slides, setActiveTitle]);

  useEffect(() => {
    setSlideProgress(slideProgress);
  }, [slideProgress, setSlideProgress]);


  if (slides.length === 0) {
    return (
      <div
        className="h-[100vh] w-[100vw]"
        style={{ backgroundColor: "var(--color-background)" }}
      />
    );
  }

  const scrollHeightVh =
    TOTAL_CYCLES * slides.length * SCROLL_VH_PER_SLIDE + 100;

  return (
    <>
      {magnifying && slides[activeIndex] && (
        <ImageMagnifier
          image={slides[activeIndex].image}
          alt={slides[activeIndex].title ?? "Overview image"}
          onClose={() => setMagnifying(false)}
        />
      )}
      <div
        className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: "var(--color-background)",
          pointerEvents: magnifying ? "none" : "auto",
          cursor: magnifying ? "default" : "zoom-in",
        }}
        onClick={() => setMagnifying(true)}
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
                  alt={slide.title ?? "Overview image"}
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
