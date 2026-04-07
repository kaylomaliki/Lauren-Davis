"use client";

import { useMemo, useState } from "react";
import type { Work } from "@/lib/queries";
import OptimizedImage from "@/components/images/OptimizedImage";
import HomepageTitleRail from "@/components/HomepageTitleRail";
import ImageMagnifier from "@/components/ImageMagnifier";
import useScrollCycle, {
  SCROLL_VH_PER_SLIDE,
  TOTAL_CYCLES,
} from "@/hooks/useScrollCycle";

interface OverviewScrollFadeProps {
  works: Work[];
}

const TRANSITION_MS = 100;

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

  const titles = useMemo(
    () => slides.map((s) => s.title?.trim() || "Untitled"),
    [slides]
  );

  const { activeIndex, scrollModPx, cyclePx, scrollToSlide } =
    useScrollCycle(slides.length);

  const [magnifying, setMagnifying] = useState(false);

  if (slides.length === 0) {
    return <div className="h-[100vh] w-[100vw]" style={{ backgroundColor: "var(--color-background)" }} />;
  }

  const scrollHeightVh =
    TOTAL_CYCLES * slides.length * SCROLL_VH_PER_SLIDE + 100;

  return (
    <>
      <HomepageTitleRail
        titles={titles}
        activeIndex={activeIndex}
        scrollModPx={scrollModPx}
        cyclePx={cyclePx}
        onNavigateToSlide={scrollToSlide}
      />
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
              <div className="relative h-[400px] w-full max-w-[1000px]">
                <OptimizedImage
                  image={slide.image}
                  alt={slide.title ?? "Overview image"}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1000px"
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
