"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

const RAIL_HEIGHT_PX = 200;
const TITLE_GAP_PX = 0;
const COPY_COUNT = 5;
const CENTER_COPY = 2;

interface HomepageTitleRailProps {
  titles: string[];
  activeIndex: number;
  scrollModPx: number;
  cyclePx: number;
  onNavigateToSlide: (index: number) => void;
  onHoverTitle: (index: number | null) => void;
}

export default function HomepageTitleRail({
  titles,
  activeIndex,
  scrollModPx,
  cyclePx,
  onNavigateToSlide,
  onHoverTitle,
}: HomepageTitleRailProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [stripHeight, setStripHeight] = useState(0);
  const [centerYs, setCenterYs] = useState<number[]>([]);

  const labels = useMemo(
    () => titles.map((t) => t.toLocaleUpperCase("en")),
    [titles]
  );

  const n = labels.length;
  const stepPx = n > 0 && cyclePx > 0 ? cyclePx / n : 0;
  const posInSlide =
    stepPx > 0 ? scrollModPx - activeIndex * stepPx : 0;
  const frac =
    stepPx > 0 ? Math.min(1, Math.max(0, posInSlide / stepPx)) : 0;
  const safeActive =
    n > 0 ? Math.min(n - 1, Math.max(0, activeIndex)) : 0;

  const trackOffset = useMemo(() => {
    if (n === 0 || centerYs.length !== n || stripHeight <= 0) return 0;

    const i = safeActive;
    const next = (i + 1) % n;
    const a = centerYs[i]!;
    const b = next > i ? centerYs[next]! : centerYs[next]! + stripHeight;

    const targetCenter = a + (b - a) * frac;
    const rawOffset = targetCenter - RAIL_HEIGHT_PX / 2;
    const folded =
      ((rawOffset % stripHeight) + stripHeight) % stripHeight;
    return folded + CENTER_COPY * stripHeight;
  }, [n, centerYs, stripHeight, safeActive, frac]);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip || n === 0) return;

    const measure = () => {
      setStripHeight(strip.offsetHeight);

      const sr = strip.getBoundingClientRect();
      const centers: number[] = [];
      for (let i = 0; i < n; i++) {
        const btn = buttonRefs.current[i];
        if (!btn) {
          centers.push(0);
          continue;
        }
        const br = btn.getBoundingClientRect();
        centers.push(br.top + br.height / 2 - sr.top);
      }
      setCenterYs(centers);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    return () => ro.disconnect();
  }, [n, labels]);

  if (n === 0) return null;

  const copies = Array.from({ length: COPY_COUNT }, (_, i) => i);
  const stripStyle = {
    gap: `${TITLE_GAP_PX}px`,
    paddingBottom: `${TITLE_GAP_PX}px`,
  };

  return (
    <nav
      className="fixed top-1/2 z-[12000] -translate-y-1/2"
      style={{
        left: "var(--padding-base)",
        height: `${RAIL_HEIGHT_PX}px`,
        maxHeight: "calc(100vh - 2 * var(--padding-base))",
      }}
      aria-label="Work titles"
    >
      <div
        className="bodycopy overflow-hidden"
        style={{
          height: "100%",
          backgroundColor: "rgba(255, 0, 0, 0)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
        }}
      >
        <div
          className="flex flex-col flex-nowrap will-change-transform"
          style={{ transform: `translate3d(0, ${-trackOffset}px, 0)` }}
        >
          {copies.map((copyIdx) => (
            <div
              key={copyIdx}
              ref={copyIdx === CENTER_COPY ? stripRef : undefined}
              className="flex shrink-0 flex-col flex-nowrap"
              style={stripStyle}
            >
              {labels.map((label, slideIndex) => (
                <button
                  key={`${copyIdx}-${slideIndex}`}
                  type="button"
                  ref={
                    copyIdx === CENTER_COPY
                      ? (el) => {
                          buttonRefs.current[slideIndex] = el;
                        }
                      : undefined
                  }
                  className="bodycopy shrink-0 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 text-left font-inherit text-inherit"
                  style={{
                    textDecoration:
                      slideIndex === safeActive ? "underline" : "none",
                    textUnderlineOffset: "0.12em",
                    paddingLeft: slideIndex === safeActive ? "0px" : "0px",
                    transition: "padding-left 0s ease",
                  }}
                  onClick={() => onNavigateToSlide(slideIndex)}
                  onMouseEnter={() => onHoverTitle(slideIndex)}
                  onMouseLeave={() => onHoverTitle(null)}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
