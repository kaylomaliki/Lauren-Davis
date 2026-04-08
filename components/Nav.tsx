"use client";

import { useActiveSlide } from "@/contexts/ActiveSlideContext";

const DOT_COUNT = 50;

export default function Nav() {
  const { activeTitle, slideProgress, magnifying } = useActiveSlide();

  const visibleDots = Math.round(slideProgress * DOT_COUNT);

  return (
    <nav
      className="bodycopy group fixed z-[11000]"
      style={{
        top: "var(--padding-base)",
        left: "var(--padding-base)",
        right: "var(--padding-base)",
        color: magnifying ? "white" : undefined,
        transition: "color 0.2s ease",
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-0">
        <a href="mailto:killauren98@gmail.com" style={{ color: "rgb(186, 186, 186)" }}>
          killauren98@gmail.com
        </a>
        {activeTitle && (
          <>
            <span>/</span>
            <span>{activeTitle}</span>
            <span>
              {Array.from({ length: DOT_COUNT }, (_, i) => (
                <span
                  key={i}
                  style={{
                    opacity: i < visibleDots ? 1 : 0,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  .
                </span>
              ))}
            </span>
          </>
        )}
      </div>
    </nav>
  );
}
