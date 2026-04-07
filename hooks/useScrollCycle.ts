"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const SCROLL_VH_PER_SLIDE = 50;

/**
 * Number of cycle repetitions in the virtual scroll height.
 * The user starts at the midpoint so they have ~50 cycles of travel
 * in either direction — effectively infinite without ever needing
 * to physically wrap scrollY (which kills scroll momentum).
 */
export const TOTAL_CYCLES = 100;

function scrollPixelsPerSlide(): number {
  return window.innerHeight * (SCROLL_VH_PER_SLIDE / 100);
}

export interface ScrollCycleState {
  activeIndex: number;
  /** Position within one cycle [0, cyclePx), drives continuous motion */
  scrollModPx: number;
  /** Full cycle length in px (slideCount * step) */
  cyclePx: number;
  scrollToSlide: (index: number) => void;
}

export default function useScrollCycle(slideCount: number): ScrollCycleState {
  const n = slideCount;
  const initializedRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollModPx, setScrollModPx] = useState(0);
  const [cyclePx, setCyclePx] = useState(0);

  useLayoutEffect(() => {
    if (initializedRef.current || n <= 1) return;
    initializedRef.current = true;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    const step = scrollPixelsPerSlide();
    const cycle = n * step;
    window.scrollTo({
      top: Math.floor(TOTAL_CYCLES / 2) * cycle,
      behavior: "auto",
    });
  }, [n]);

  const scrollToY = useCallback((y: number, instant: boolean) => {
    window.scrollTo({ top: y, behavior: instant ? "auto" : "smooth" });
  }, []);

  const scrollToSlide = useCallback(
    (index: number) => {
      if (n === 0) return;
      const step = scrollPixelsPerSlide();
      const cycle = n * step;
      const currentCycleStart =
        Math.floor(window.scrollY / cycle) * cycle;
      const target = ((index % n) + n) % n;
      scrollToY(currentCycleStart + target * step, true);
    },
    [n, scrollToY]
  );

  const sync = useCallback(() => {
    if (n === 0) return;

    const step = scrollPixelsPerSlide();
    if (step <= 0) return;

    const cycle = n * step;
    setCyclePx(cycle);

    if (n <= 1) {
      setActiveIndex(0);
      setScrollModPx(0);
      return;
    }

    const y = Math.max(0, window.scrollY);
    const mod = ((y % cycle) + cycle) % cycle;
    const idx = Math.floor(mod / step) % n;
    setActiveIndex((prev) => (prev === idx ? prev : idx));
    setScrollModPx(mod);
  }, [n]);

  useLayoutEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  useEffect(() => {
    if (n <= 1) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const step = scrollPixelsPerSlide();
      const cycle = n * step;
      const y = Math.max(0, window.scrollY);
      const mod = ((y % cycle) + cycle) % cycle;
      const idx = Math.floor(mod / step) % n;
      const currentCycleStart = Math.floor(y / cycle) * cycle;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIdx = (idx + 1) % n;
        const adjust = nextIdx === 0 ? cycle : 0;
        scrollToY(currentCycleStart + adjust + nextIdx * step, false);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIdx = (idx - 1 + n) % n;
        const adjust = prevIdx === n - 1 ? -cycle : 0;
        scrollToY(currentCycleStart + adjust + prevIdx * step, false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [n, scrollToY]);

  return { activeIndex, scrollModPx, cyclePx, scrollToSlide };
}
