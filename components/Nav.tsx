"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useActiveSlide } from "@/contexts/ActiveSlideContext";
import { useWorkFilter } from "@/contexts/WorkFilterContext";
import { WORK_TAGS, type WorkTag } from "@/lib/queries";

const DOT_COUNT = 30;

/** Above magnifier (`--z-magnifier`), below intro (`--z-site-intro`). */
const NAV_Z = "z-[var(--z-nav)]";

function formatWorkTagLabel(tag: WorkTag): string {
  return tag
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Nav() {
  const pathname = usePathname();
  const isWorkPage = pathname === "/work";
  const {
    selectedTags,
    toggleTag,
    clearFilters,
  } = useWorkFilter();

  useEffect(() => {
    if (pathname !== "/work") {
      clearFilters();
    }
  }, [pathname, clearFilters]);

  const {
    activeTitle,
    slideProgress,
    magnifying,
    overviewSlideIndex,
    overviewSlideCount,
  } = useActiveSlide();

  const visibleDots = Math.round(slideProgress * DOT_COUNT);
  const currentSlide = overviewSlideIndex + 1;
  const showSlideIndex = overviewSlideCount > 0;

  return (
    <>
      <nav
        className={`group fixed inset-x-0 top-0 ${NAV_Z} flex items-start gap-4`}
        style={{
          paddingLeft: "var(--padding-base)",
          paddingRight: "var(--padding-base)",
          paddingTop: "var(--padding-base)",
          color: magnifying ? "white" : "var(--color-text-grey)",
          transition: "color 0.2s ease",
        }}
        aria-label="Main navigation"
      >
        <div className="h1 flex min-w-0 flex-wrap items-start gap-0">
          <a
            href="mailto:killauren98@gmail.com"
            className="underline-offset-2 hover:underline"
            style={{
              color: magnifying ? "white" : "var(--color-text-grey)",
              transition: "color 0.2s ease",
            }}
          >
            killauren98@gmail.com
          </a>
          {activeTitle && (
            <span
              className="inline-flex items-center gap-0"
              style={{
                color: magnifying ? "white" : "var(--color-text)",
                transition: "color 0.2s ease",
              }}
            >
              <span>/</span>
              <span>{activeTitle}</span>
              <span className="hidden lg:inline">
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
            </span>
          )}
        </div>
      </nav>

      <nav
        className={`fixed inset-x-0 bottom-0 ${NAV_Z} flex w-full items-start justify-start px-[var(--padding-base)] pb-[var(--padding-base)]`}
        aria-label="View all, information, slide index, and work filters"
      >
        <div className="flex items-stretch gap-[50px]">
          <div className="flex items-stretch gap-[5px]">
            <div
              className="w-px shrink-0"
              style={{
                backgroundColor: magnifying ? "white" : "#000000",
                transition: "background-color 0.2s ease",
              }}
              aria-hidden
            />

            <div className="flex flex-col items-start gap-1">
              <Link
                href={isWorkPage ? "/" : "/work"}
                className="h2 inline-flex shrink-0 items-center justify-center leading-none underline-offset-2 hover:underline"
                style={{
                  color: magnifying ? "white" : "var(--color-text)",
                  transition: "color 0.2s ease",
                }}
                aria-label={isWorkPage ? "Back" : "View all work"}
              >
                {isWorkPage ? "Back" : "View All"}
              </Link>
              <span
                className="h2 leading-none"
                style={{
                  color: magnifying ? "white" : "var(--color-text)",
                  transition: "color 0.2s ease",
                }}
              >
                Information
              </span>
            </div>
          </div>

          {showSlideIndex && (
            <div className="flex items-stretch gap-[5px]">
              <div
                className="w-px shrink-0"
                style={{
                  backgroundColor: magnifying ? "white" : "#000000",
                  transition: "background-color 0.2s ease",
                }}
                aria-hidden
              />
              <div className="flex flex-col items-start justify-start gap-1">
                <span
                  className="h2 leading-none"
                  style={{
                    color: magnifying ? "white" : "var(--color-text)",
                    transition: "color 0.2s ease",
                  }}
                >
                  Selected Work
                </span>
                <span
                  className="h2 select-none leading-none"
                  aria-live="polite"
                  aria-label={`Image ${currentSlide} of ${overviewSlideCount}`}
                  style={{
                    color: magnifying ? "white" : "var(--color-text)",
                    transition: "color 0.2s ease",
                  }}
                >
                  {currentSlide}/{overviewSlideCount}
                </span>
              </div>
            </div>
          )}

          {isWorkPage && (
            <div className="flex items-stretch gap-[5px]">
              <div
                className="w-px shrink-0"
                style={{
                  backgroundColor: magnifying ? "white" : "#000000",
                  transition: "background-color 0.2s ease",
                }}
                aria-hidden
              />
              <div className="flex max-w-[min(100vw-2rem,560px)] flex-col items-start justify-start gap-1">
                <div className="flex min-w-0 flex-row items-center gap-1">
                  <span
                    className="h2 leading-none"
                    style={{
                      color: magnifying ? "white" : "var(--color-text)",
                      transition: "color 0.2s ease",
                    }}
                  >
                    Filter
                  </span>
                  {selectedTags.size > 0 && (
                    <button
                      type="button"
                      className="h2 inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 leading-none"
                      style={{
                        color: magnifying ? "white" : "var(--color-text)",
                        transition: "color 0.2s ease",
                      }}
                      aria-label="Clear filters"
                      onClick={clearFilters}
                    >
                      <svg
                        className="block h-[1em] w-[1em] shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke="currentColor"
                        aria-hidden
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div
                  className="h2 inline-flex w-full min-w-0 flex-wrap items-center gap-[5px] leading-none"
                  role="group"
                  aria-label="Filter by project tag"
                >
                  {WORK_TAGS.map((tag, i) => {
                    const selected = selectedTags.has(tag);
                    const opacity =
                      selectedTags.size === 0 ? 1 : selected ? 1 : 0.3;
                    const isLast = i === WORK_TAGS.length - 1;
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center"
                      >
                        <button
                          type="button"
                          className="h2 inline cursor-pointer border-0 bg-transparent p-0 leading-none underline-offset-2 hover:underline"
                          style={{
                            color: magnifying ? "white" : "var(--color-text)",
                            opacity,
                            transition: "color 0.2s ease, opacity 0.2s ease",
                          }}
                          aria-pressed={selected}
                          onClick={() => toggleTag(tag)}
                        >
                          {formatWorkTagLabel(tag)}
                        </button>
                        {!isLast && (
                          <span
                            aria-hidden
                            className="select-none"
                            style={{
                              color: magnifying
                                ? "white"
                                : "var(--color-text)",
                              transition: "color 0.2s ease",
                            }}
                          >
                            ,{" "}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
