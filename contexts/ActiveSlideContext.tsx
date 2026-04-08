"use client";

import { createContext, useContext, useState } from "react";

const ActiveSlideContext = createContext<{
  activeTitle: string;
  setActiveTitle: (title: string) => void;
  slideProgress: number;
  setSlideProgress: (progress: number) => void;
  magnifying: boolean;
  setMagnifying: (v: boolean) => void;
} | null>(null);

export function ActiveSlideProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTitle, setActiveTitle] = useState("");
  const [slideProgress, setSlideProgress] = useState(0);
  const [magnifying, setMagnifying] = useState(false);
  return (
    <ActiveSlideContext.Provider
      value={{ activeTitle, setActiveTitle, slideProgress, setSlideProgress, magnifying, setMagnifying }}
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
