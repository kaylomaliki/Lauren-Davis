"use client";

import { createContext, useCallback, useContext, useState } from "react";

const ActiveSlideContext = createContext<{
  activeTitle: string;
  setActiveTitle: (title: string) => void;
  slideProgress: number;
  setSlideProgress: (progress: number) => void;
  magnifying: boolean;
  setMagnifying: (v: boolean) => void;
  overviewSlideIndex: number;
  overviewSlideCount: number;
  setOverviewSlides: (index: number, count: number) => void;
} | null>(null);

export function ActiveSlideProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTitle, setActiveTitle] = useState("");
  const [slideProgress, setSlideProgress] = useState(0);
  const [magnifying, setMagnifying] = useState(false);
  const [overviewSlideIndex, setOverviewSlideIndex] = useState(0);
  const [overviewSlideCount, setOverviewSlideCount] = useState(0);

  const setOverviewSlides = useCallback((index: number, count: number) => {
    setOverviewSlideIndex(index);
    setOverviewSlideCount(count);
  }, []);

  return (
    <ActiveSlideContext.Provider
      value={{
        activeTitle,
        setActiveTitle,
        slideProgress,
        setSlideProgress,
        magnifying,
        setMagnifying,
        overviewSlideIndex,
        overviewSlideCount,
        setOverviewSlides,
      }}
    >
      {children}
    </ActiveSlideContext.Provider>
  );
}

export function useActiveSlide() {
  const ctx = useContext(ActiveSlideContext);
  if (!ctx)
    throw new Error("useActiveSlide must be used within ActiveSlideProvider");
  return ctx;
}
