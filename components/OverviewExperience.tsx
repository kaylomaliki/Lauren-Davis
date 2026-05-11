"use client";

import { useEffect, useState } from "react";
import type { Work } from "@/lib/queries";
import OverviewScrollFade from "@/components/OverviewScrollFade";
import OverviewScrollSnap from "@/components/OverviewScrollSnap";

/** Tailwind `lg` — snap scroll on smaller viewports, infinite scroll fade on desktop. */
const DESKTOP_MIN_WIDTH_PX = 1024;

interface OverviewExperienceProps {
  works: Work[];
}

export default function OverviewExperience({ works }: OverviewExperienceProps) {
  const [mode, setMode] = useState<"snap" | "fade" | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH_PX}px)`);
    const apply = () => setMode(mq.matches ? "fade" : "snap");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (mode === null) {
    return (
      <div
        className="h-[100svh] w-full bg-[var(--color-background)]"
        aria-hidden
      />
    );
  }

  if (mode === "snap") {
    return (
      <main className="relative h-[100svh] min-h-0 w-full overflow-hidden bg-[var(--color-background)]">
        <OverviewScrollSnap works={works} />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full">
      <OverviewScrollFade works={works} />
    </main>
  );
}
