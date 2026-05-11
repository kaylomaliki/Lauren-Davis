"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MouseEvent } from "react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import OptimizedImage from "@/components/images/OptimizedImage";
import ImageMagnifier from "@/components/ImageMagnifier";
import { useActiveSlide } from "@/contexts/ActiveSlideContext";
import type { Work, WorkTag } from "@/lib/queries";

const ROW_WIDTH_CLAMP = "clamp(40vw, 90vw, 90vw)";
/** Vertical extent of the + is (rowWidth/hCount)*verticalSlots; cap row width so this ≤ PLUS_MAX_VH of viewport height. */
const PLUS_MAX_VH = .9;
/** Approximate top/bottom nav padding on the work layout so the + cap fits the visible band. */
const VIEWPORT_NAV_RESERVE_PX = 144;

/** Stable empty set for default `selectedTags` (avoid new Set() each render). */
const EMPTY_SELECTED_TAGS = new Set<WorkTag>();

interface FlatGalleryItem {
  id: string;
  alt: string;
  image: SanityImageSource;
  /** Parent work tag — used for filter dimming (layout stays fixed). */
  tag?: WorkTag;
}

function flattenWorks(works: Work[]): FlatGalleryItem[] {
  return works.flatMap((work) =>
    (work.images ?? []).flatMap((item, imageIndex) => {
      if (item.image == null) return [];
      const alt =
        item.title?.trim() ||
        work.title?.trim() ||
        `Image ${imageIndex + 1}`;
      return [
        {
          id: `${work._id}-${imageIndex}`,
          image: item.image,
          alt,
          tag: work.tag,
        },
      ];
    })
  );
}

function itemMatchesFilter(
  tag: WorkTag | undefined,
  selectedTags: ReadonlySet<WorkTag>
): boolean {
  if (selectedTags.size === 0) return true;
  return tag != null && selectedTags.has(tag);
}

/**
 * Split flat images between horizontal row and vertical column.
 * Vertical stack has `vCount` images plus one empty center slot ⇒ `vCount + 1` slots total.
 * Horizontal count matches that slot count when N is odd (`hCount === vCount + 1`).
 * When N is even, use `hCount = N/2 + 1`, `vCount = N/2 - 1` so the row is never
 * shorter than the vertical slot count (blank counts like a cell for layout balance).
 */
function splitStacks(items: FlatGalleryItem[]) {
  const n = items.length;
  let hCount: number;
  let vCount: number;

  if (n === 0) {
    hCount = 0;
    vCount = 0;
  } else if (n % 2 === 1) {
    hCount = (n + 1) / 2;
    vCount = (n - 1) / 2;
  } else {
    hCount = n / 2 + 1;
    vCount = n / 2 - 1;
  }

  const horizontal = items.slice(0, hCount);
  const vertical = items.slice(hCount);
  const verticalSlots = vCount > 0 ? vCount + 1 : 0;
  const emptyVerticalIdx =
    verticalSlots > 0 ? Math.floor((verticalSlots - 1) / 2) : -1;

  return {
    n,
    hCount,
    vCount,
    horizontal,
    vertical,
    verticalSlots,
    emptyVerticalIdx,
  } as const;
}

interface WorkPlusGalleryProps {
  works: Work[];
  /** When non-empty, images whose work tag is not selected use opacity 0 and no pointer events. */
  selectedTags?: ReadonlySet<WorkTag>;
}

export default function WorkPlusGallery({
  works,
  selectedTags = EMPTY_SELECTED_TAGS,
}: WorkPlusGalleryProps) {
  const { setActiveTitle, magnifying, setMagnifying } = useActiveSlide();
  const items = useMemo(() => flattenWorks(works), [works]);
  const split = useMemo(() => splitStacks(items), [items]);

  const rowRef = useRef<HTMLDivElement>(null);
  /** Flat index of image opened in `ImageMagnifier` (work page only). */
  const [magnifierFlatIndex, setMagnifierFlatIndex] = useState<number | null>(
    null
  );
  const [thumbPx, setThumbPx] = useState<number | null>(null);
  /** Upper bound on row width (px) so vertical extent ≤ 70vh (see layout math below). */
  const [maxRowWidthPx, setMaxRowWidthPx] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    const updateCap = () => {
      if (split.hCount <= 0) {
        setMaxRowWidthPx(null);
        return;
      }
      const cap = Math.max(
        160,
        window.innerHeight * PLUS_MAX_VH - VIEWPORT_NAV_RESERVE_PX
      );
      const w =
        split.verticalSlots > 0
          ? (cap * split.hCount) / split.verticalSlots
          : cap * split.hCount;
      setMaxRowWidthPx(w);
    };
    updateCap();
    window.addEventListener("resize", updateCap);
    return () => window.removeEventListener("resize", updateCap);
  }, [split.hCount, split.verticalSlots]);

  const measureThumb = useCallback(() => {
    const el = rowRef.current;
    if (!el || split.hCount <= 0) return;
    setThumbPx(el.offsetWidth / split.hCount);
  }, [split.hCount]);

  useLayoutEffect(() => {
    measureThumb();
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measureThumb());
    ro.observe(el);
    window.addEventListener("resize", measureThumb);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureThumb);
    };
  }, [measureThumb]);

  const hoveredItem =
    hoveredIndex !== null ? items[hoveredIndex] ?? null : null;

  const thumbOpacity = useCallback(
    (flatIndex: number) =>
      hoveredIndex === null ? 1 : hoveredIndex === flatIndex ? 1 : 0.1,
    [hoveredIndex]
  );

  const thumbInteractionStyle = useCallback(
    (flatIndex: number, tag?: WorkTag) => {
      const matches = itemMatchesFilter(tag, selectedTags);
      if (!matches) {
        return {
          opacity: .05,
          pointerEvents: "none" as const,
        };
      }
      return {
        opacity: thumbOpacity(flatIndex),
        pointerEvents: "auto" as const,
      };
    },
    [selectedTags, thumbOpacity]
  );

  useEffect(() => {
    setHoveredIndex((prev) => {
      if (prev === null) return null;
      const item = items[prev];
      if (!item || !itemMatchesFilter(item.tag, selectedTags)) return null;
      return prev;
    });
  }, [selectedTags, items]);

  useEffect(() => {
    if (hoveredIndex === null) {
      setActiveTitle("");
      return;
    }
    const item = items[hoveredIndex];
    if (!item || !itemMatchesFilter(item.tag, selectedTags)) {
      setActiveTitle("");
      return;
    }
    setActiveTitle(item.alt.trim());
  }, [hoveredIndex, items, selectedTags, setActiveTitle]);

  useEffect(() => {
    return () => setActiveTitle("");
  }, [setActiveTitle]);

  useEffect(() => {
    setMagnifying(false);
    setMagnifierFlatIndex(null);
    return () => {
      setMagnifying(false);
      setMagnifierFlatIndex(null);
    };
  }, [setMagnifying]);

  const closeMagnifier = useCallback(() => {
    setMagnifying(false);
    setMagnifierFlatIndex(null);
  }, [setMagnifying]);

  const handleThumbClick = useCallback(
    (flatIdx: number) => {
      if (hoveredIndex !== flatIdx) return;
      const item = items[flatIdx];
      if (!item || !itemMatchesFilter(item.tag, selectedTags)) return;
      setHoveredIndex(null);
      setMagnifierFlatIndex(flatIdx);
      setMagnifying(true);
    },
    [hoveredIndex, items, selectedTags, setMagnifying]
  );

  const clearHoverUnlessMovingToThumb = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const next = e.relatedTarget as HTMLElement | null;
      if (next?.closest?.("[data-gallery-thumb]")) return;
      setHoveredIndex(null);
    },
    []
  );

  if (split.n === 0) {
    return (
      <main className="relative h-[100svh] max-h-[100svh] min-h-0 w-full overflow-hidden bg-[var(--color-background)]" />
    );
  }

  const thumbSizes = `${Math.max(15, Math.ceil(100 / split.hCount))}vw`;

  const magnifierItem =
    magnifierFlatIndex !== null ? items[magnifierFlatIndex] ?? null : null;

  /** Same cell size used for layout extent (fallback before first measure). */
  const cellPx =
    thumbPx ??
    (maxRowWidthPx != null ? maxRowWidthPx / split.hCount : null);

  const galleryBlockHeight =
    cellPx != null
      ? split.verticalSlots > 0
        ? cellPx * split.verticalSlots
        : cellPx
      : undefined;

  return (
    <main
      className="relative h-[100svh] max-h-[100svh] min-h-0 w-full overflow-hidden bg-[var(--color-background)]"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {magnifying && magnifierItem && (
        <ImageMagnifier
          image={magnifierItem.image}
          alt={magnifierItem.alt}
          onClose={closeMagnifier}
        />
      )}
      {hoveredItem &&
        !magnifying &&
        itemMatchesFilter(hoveredItem.tag, selectedTags) && (
          <div
            className="pointer-events-none fixed inset-0 z-[10050] flex items-center justify-center px-[var(--padding-base)]"
            aria-hidden
          >
            <div className="relative h-[40vh] max-h-[50svh] w-full max-w-[90vw]">
              <OptimizedImage
                image={hoveredItem.image}
                alt={hoveredItem.alt}
                fill
                sizes="90vw"
                objectFit="contain"
                className="object-contain"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        )}

      <div
        className="relative flex h-full min-h-0 w-full items-center justify-center px-[var(--padding-base)] pb-[calc(var(--padding-base)+4rem)] pt-[calc(var(--padding-base)+3rem)]"
        style={{
          pointerEvents: magnifying ? "none" : "auto",
          cursor: magnifying ? "default" : undefined,
        }}
      >
        <div
          className="flex shrink-0 flex-col items-center justify-center"
          style={{
            width:
              maxRowWidthPx != null
                ? `min(${ROW_WIDTH_CLAMP}, ${maxRowWidthPx}px)`
                : ROW_WIDTH_CLAMP,
          }}
        >
          {/* Explicit height = full + extent so flex centering includes arms (abs children do not stretch flow). */}
          <div
            className="relative w-full shrink-0"
            style={
              galleryBlockHeight != null
                ? {
                    height: galleryBlockHeight,
                    minHeight: galleryBlockHeight,
                  }
                : undefined
            }
          >
            <div
              ref={rowRef}
              className="absolute left-0 right-0 z-[2] grid w-full"
              style={{
                top:
                  split.verticalSlots > 0 && cellPx != null
                    ? split.emptyVerticalIdx * cellPx
                    : 0,
                height: cellPx ?? undefined,
                gridTemplateColumns: `repeat(${split.hCount}, minmax(0, 1fr))`,
              }}
            >
              {split.horizontal.map((entry, i) => (
                <button
                  key={entry.id}
                  type="button"
                  data-gallery-thumb
                  className="relative aspect-square min-h-0 min-w-0 w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0"
                  style={{
                    ...thumbInteractionStyle(i, entry.tag),
                    transition: "opacity 0.1s ease",
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={clearHoverUnlessMovingToThumb}
                  onClick={() => handleThumbClick(i)}
                  aria-label={entry.alt}
                >
                  <OptimizedImage
                    image={entry.image}
                    alt={entry.alt}
                    fill
                    sizes={thumbSizes}
                    objectFit="cover"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {split.vCount > 0 && cellPx != null && (
              <div
                className="absolute left-1/2 top-0 z-[1] flex -translate-x-1/2 flex-col"
                style={{
                  width: cellPx,
                  height: cellPx * split.verticalSlots,
                }}
              >
              {(() => {
                let vi = 0;
                return Array.from(
                  { length: split.verticalSlots },
                  (_, slotIdx) => {
                    if (slotIdx === split.emptyVerticalIdx) {
                      return (
                        <div
                          key={`v-gap-${slotIdx}`}
                          className="min-h-0 flex-1 bg-transparent"
                          aria-hidden
                        />
                      );
                    }

                    const entry = split.vertical[vi];
                    const flatIdx = split.hCount + vi;
                    vi += 1;

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        data-gallery-thumb
                        className="relative min-h-0 flex-1 cursor-pointer overflow-hidden border-0 bg-transparent p-0"
                        style={{
                          ...thumbInteractionStyle(flatIdx, entry.tag),
                          transition: "opacity 0.1s ease",
                        }}
                        onMouseEnter={() => setHoveredIndex(flatIdx)}
                        onMouseLeave={clearHoverUnlessMovingToThumb}
                        onClick={() => handleThumbClick(flatIdx)}
                        aria-label={entry.alt}
                      >
                        <OptimizedImage
                          image={entry.image}
                          alt={entry.alt}
                          fill
                          sizes={thumbSizes}
                          objectFit="cover"
                          className="object-cover"
                        />
                      </button>
                    );
                  }
                );
              })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
