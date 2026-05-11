"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlForImage } from "@/lib/image";

const ZOOM_SCALE = 1.5;
/** Desktop only: smooth follow toward cursor. Touch uses instant snap (see RAF tick). */
const DESKTOP_LERP_FACTOR = 0.05;
const MINIMAP_HEIGHT = 80;
const CROSSHAIR_SIZE = 30;
/** Tailwind `lg` — tablet & phone use height-based background sizing (min 100svh). */
const TABLET_MOBILE_MAX_PX = 1023;
/** If pointer moves less than this (CSS px), pointer-up counts as tap-to-close (mobile/tablet). */
const TAP_CLOSE_MAX_MOVE_PX = 14;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

interface ImageMagnifierProps {
  image: SanityImageSource;
  alt: string;
  onClose: () => void;
}

export default function ImageMagnifier({
  image,
  alt,
  onClose,
}: ImageMagnifierProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0.5, y: 0.5 });
  const displayPos = useRef({ x: 0.5, y: 0.5 });
  const bgRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const touchPanLastRef = useRef({ x: 0, y: 0 });
  const touchPanMoveAccumRef = useRef(0);

  const [lowLoaded, setLowLoaded] = useState(false);
  const [hiLoaded, setHiLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1.5);
  const [dims, setDims] = useState({ w: 1200, h: 800 });
  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  useEffect(() => {
    const sync = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  /** Lock page scroll on phone/tablet while open (wheel + overscroll still blocked separately). */
  useEffect(() => {
    if (dims.w > TABLET_MOBILE_MAX_PX) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [dims.w]);

  const isTabletOrMobile = dims.w <= TABLET_MOBILE_MAX_PX;

  const { lowSrc, hiSrc } = useMemo(() => {
    if (!image) return { lowSrc: null, hiSrc: null };
    try {
      const vw = dims.w;
      const vh = dims.h;
      const narrow = vw <= TABLET_MOBILE_MAX_PX;
      if (narrow) {
        const lowPx = Math.round(Math.max(vw * 0.5, vh * 0.6));
        const hiPx = Math.round(Math.max(vw * 2, vh * 2 * ZOOM_SCALE));
        return {
          lowSrc: urlForImage(image).width(lowPx).quality(60).url(),
          hiSrc: urlForImage(image).width(hiPx).quality(80).url(),
        };
      }
      return {
        lowSrc: urlForImage(image).width(Math.round(vw * 0.5)).quality(60).url(),
        hiSrc: urlForImage(image).width(Math.round(vw * 2)).quality(80).url(),
      };
    } catch {
      return { lowSrc: null, hiSrc: null };
    }
  }, [image, dims]);

  useEffect(() => {
    setLowLoaded(false);
    setHiLoaded(false);
  }, [lowSrc, hiSrc]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetPos.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handlePointerDownTouchPan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dims.w > TABLET_MOBILE_MAX_PX || !e.isPrimary) return;
    if (e.pointerType !== "touch") return;
    touchPanLastRef.current = { x: e.clientX, y: e.clientY };
    touchPanMoveAccumRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [dims.w]);

  const handlePointerMoveTouchPan = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dims.w > TABLET_MOBILE_MAX_PX) return;
      if (e.pointerType !== "touch") return;
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const dx = e.clientX - touchPanLastRef.current.x;
      const dy = e.clientY - touchPanLastRef.current.y;
      touchPanLastRef.current = { x: e.clientX, y: e.clientY };
      touchPanMoveAccumRef.current += Math.abs(dx) + Math.abs(dy);

      const nx = targetPos.current.x - dx / rect.width;
      const ny = targetPos.current.y - dy / rect.height;
      targetPos.current.x = clamp(nx, 0, 1);
      targetPos.current.y = clamp(ny, 0, 1);
      displayPos.current.x = targetPos.current.x;
      displayPos.current.y = targetPos.current.y;

      const bgX = displayPos.current.x * 100;
      const bgY = displayPos.current.y * 100;
      if (bgRef.current) {
        bgRef.current.style.backgroundPosition = `${bgX}% ${bgY}%`;
      }
      if (crosshairRef.current) {
        crosshairRef.current.style.left = `${displayPos.current.x * 100}%`;
        crosshairRef.current.style.top = `${displayPos.current.y * 100}%`;
      }
    },
    [dims.w],
  );

  const handlePointerUpTouchPan = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dims.w > TABLET_MOBILE_MAX_PX) return;
      if (e.pointerType !== "touch") return;
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (touchPanMoveAccumRef.current < TAP_CLOSE_MAX_MOVE_PX) {
        onClose();
      }
    },
    [dims.w, onClose],
  );

  const handlePointerCancelTouchPan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dims.w > TABLET_MOBILE_MAX_PX) return;
    if (e.pointerType !== "touch") return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, [dims.w]);

  /** Block wheel scrolling the page behind the overlay on narrow viewports. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || dims.w > TABLET_MOBILE_MAX_PX) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [dims.w]);

  const handleLowLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
    setLowLoaded(true);
  }, []);

  useEffect(() => {
    const tick = () => {
      const narrow = dimsRef.current.w <= TABLET_MOBILE_MAX_PX;
      const dx = targetPos.current.x - displayPos.current.x;
      const dy = targetPos.current.y - displayPos.current.y;

      // Phone/tablet: no smoothing — lerp was fighting 1:1 pointer updates and felt “floaty”.
      const lerp = narrow ? 1 : DESKTOP_LERP_FACTOR;
      displayPos.current.x += dx * lerp;
      displayPos.current.y += dy * lerp;

      const bgX = displayPos.current.x * 100;
      const bgY = displayPos.current.y * 100;

      if (bgRef.current) {
        bgRef.current.style.backgroundPosition = `${bgX}% ${bgY}%`;
      }

      if (crosshairRef.current) {
        const left = displayPos.current.x * 100;
        const top = displayPos.current.y * 100;
        crosshairRef.current.style.left = `${left}%`;
        crosshairRef.current.style.top = `${top}%`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!lowSrc || !hiSrc) return null;

  const activeSrc = hiLoaded ? hiSrc : lowSrc;
  const minimapWidth = Math.round(MINIMAP_HEIGHT * aspectRatio);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[var(--z-magnifier)] overscroll-none ${isTabletOrMobile ? "touch-none cursor-zoom-out" : "cursor-zoom-out"}`}
      style={{ backgroundColor: "var(--color-background)", overscrollBehavior: "none" }}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onPointerDown={handlePointerDownTouchPan}
      onPointerMove={handlePointerMoveTouchPan}
      onPointerUp={handlePointerUpTouchPan}
      onPointerCancel={handlePointerCancelTouchPan}
      role="dialog"
      aria-label={`Magnified view: ${alt}`}
    >
      <div
        ref={bgRef}
        className="absolute inset-0 max-lg:min-h-[100svh]"
        style={{
          backgroundImage: lowLoaded ? `url(${activeSrc})` : undefined,
          backgroundSize: isTabletOrMobile
            ? `auto max(${ZOOM_SCALE * 100}svh, 100svh)`
            : `${ZOOM_SCALE * 100}%`,
          backgroundPosition: "50% 50%",
          backgroundRepeat: "no-repeat",
          opacity: lowLoaded ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      />

      {lowLoaded && (
        <div
          className="pointer-events-none absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: minimapWidth,
            height: MINIMAP_HEIGHT,
            border: "1px solid rgb(255, 255, 255)",
            backgroundColor: "rgba(186, 186, 186, 0.23)",
            overflow: "hidden",
            borderRadius: "0px",
            transition: "width 0.3s ease",
          }}
        >
          <div
            ref={crosshairRef}
            className="absolute"
            style={{
              transform: "translate(-50%, -50%)",
              left: "50%",
              top: "50%",
              color: "rgb(255, 255, 255)",
              fontSize: CROSSHAIR_SIZE,
              lineHeight: 1,
            }}
          >
            ⊹
          </div>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={lowSrc}
        alt=""
        aria-hidden
        className="hidden"
        onLoad={handleLowLoad}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hiSrc}
        alt=""
        aria-hidden
        className="hidden"
        onLoad={() => setHiLoaded(true)}
      />
    </div>
  );
}
