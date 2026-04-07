"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlForImage } from "@/lib/image";

const ZOOM_SCALE = 1.4;

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
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [loaded, setLoaded] = useState(false);

  const src = useMemo(() => {
    if (!image) return null;
    try {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      return urlForImage(image).width(w).quality(85).url();
    } catch {
      return null;
    }
  }, [image]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!src) return null;

  const bgX = mousePos.x * 100;
  const bgY = mousePos.y * 100;

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
        className="absolute inset-0"
        style={{
          backgroundImage: loaded ? `url(${src})` : undefined,
          backgroundSize: `${ZOOM_SCALE * 100}%`,
          backgroundPosition: `${bgX}% ${bgY}%`,
          backgroundRepeat: "no-repeat",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      />
      {/* Hidden img to trigger load event */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="hidden"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
