"use client";

import { createContext, useContext, useState } from "react";

const GallerySelectionContext = createContext<{
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
} | null>(null);

export function GallerySelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  return (
    <GallerySelectionContext.Provider
      value={{ selectedIndex, setSelectedIndex }}
    >
      {children}
    </GallerySelectionContext.Provider>
  );
}

export function useGallerySelection() {
  const ctx = useContext(GallerySelectionContext);
  if (!ctx) throw new Error("useGallerySelection must be used within GallerySelectionProvider");
  return ctx;
}
