"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Work } from "@/lib/queries";
import OptimizedImage from "@/components/images/OptimizedImage";
import ImageMagnifier from "@/components/ImageMagnifier";
import { useActiveSlide } from "@/contexts/ActiveSlideContext";

interface OverviewScrollSnapProps {
  works: Work[];
}

export default function OverviewScrollSnap({ works }: OverviewScrollSnapProps) {
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const {
    setActiveTitle,
    setSlideProgress,
    magnifying,
    setMagnifying,
    setOverviewSlides,
  } = useActiveSlide();

  const syncFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slides.length === 0) return;

    const h = el.clientHeight;
    if (h <= 0) return;

    const scrollTop = el.scrollTop;
    const idx = Math.min(
      slides.length - 1,
      Math.max(0, Math.round(scrollTop / h))
    );
    setActiveIndex(idx);

    const slideOffset = idx * h;
    const within = (scrollTop - slideOffset) / h;
    const progress = Math.min(1, Math.max(0, within));
    setSlideProgress(progress);
  }, [slides.length, setSlideProgress]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    syncFromScroll();

    el.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll);

    return () => {
      el.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
    };
  }, [syncFromScroll]);

  useEffect(() => {
    const title = slides[activeIndex]?.title?.trim() || "";
    setActiveTitle(title);
  }, [activeIndex, slides, setActiveTitle]);

  useEffect(() => {
    if (slides.length === 0) {
      setOverviewSlides(0, 0);
      return;
    }
    setOverviewSlides(activeIndex, slides.length);
    return () => setOverviewSlides(0, 0);
  }, [activeIndex, slides.length, setOverviewSlides]);

  useEffect(() => {
    setMagnifying(false);
    return () => setMagnifying(false);
  }, [setMagnifying]);

  if (slides.length === 0) {
    return (
      <div
        className="h-[100svh] w-[100vw]"
        style={{ backgroundColor: "var(--color-background)" }}
      />
    );
  }

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
        ref={scrollRef}
        className="relative z-0 h-[100svh] w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
        style={{
          backgroundColor: "var(--color-background)",
          pointerEvents: magnifying ? "none" : "auto",
          cursor: magnifying ? "default" : "zoom-in",
          WebkitOverflowScrolling: "touch",
        }}
        onClick={() => setMagnifying(true)}
      >
        {slides.map((slide, index) => (
          <section
            key={slide.id}
            className="flex h-[100svh] w-full shrink-0 snap-start snap-always items-center justify-center"
            aria-hidden={index !== activeIndex}
          >
            <div
              className="relative"
              style={{
                height: "70vh",
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
          </section>
        ))}
      </div>
    </>
  );
}
