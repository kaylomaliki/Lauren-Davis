"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlForImage } from "@/lib/image";

const ZOOM_SCALE = 1.5;
const LERP_FACTOR = 0.05;
const MINIMAP_HEIGHT = 100;
const CROSSHAIR_SIZE = 40;

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

  const [lowLoaded, setLowLoaded] = useState(false);
  const [hiLoaded, setHiLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1.5);

  const { lowSrc, hiSrc } = useMemo(() => {
    if (!image) return { lowSrc: null, hiSrc: null };
    try {
      const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
      return {
        lowSrc: urlForImage(image).width(Math.round(vw * 0.5)).quality(60).url(),
        hiSrc: urlForImage(image).width(Math.round(vw * 2)).quality(80).url(),
      };
    } catch {
      return { lowSrc: null, hiSrc: null };
    }
  }, [image]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetPos.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handleLowLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
    setLowLoaded(true);
  }, []);

  useEffect(() => {
    const tick = () => {
      const dx = targetPos.current.x - displayPos.current.x;
      const dy = targetPos.current.y - displayPos.current.y;

      displayPos.current.x += dx * LERP_FACTOR;
      displayPos.current.y += dy * LERP_FACTOR;

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
      className="fixed inset-0 z-[10000] cursor-zoom-out"
      style={{ backgroundColor: "var(--color-background)" }}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      role="dialog"
      aria-label={`Magnified view: ${alt}`}
    >
      <div
        ref={bgRef}
        className="absolute inset-0"
        style={{
          backgroundImage: lowLoaded ? `url(${activeSrc})` : undefined,
          backgroundSize: `${ZOOM_SCALE * 100}%`,
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
