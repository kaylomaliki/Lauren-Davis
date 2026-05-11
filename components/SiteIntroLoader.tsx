"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const NAME_PREFIX = "killauren";
const TYPING_MS = 80;
const COUNT_DURATION_MS = 2000;

/** Maps linear time 0–1 to progress that eases out (fast start, slow finish). */
function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}
const HOLD_AT_END_MS = 280;
const FADE_MS = 650;

type Phase = "typing" | "counting" | "hold" | "fade" | "done";

export default function SiteIntroLoader() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedLen, setTypedLen] = useState(0);
  const [count, setCount] = useState(0);
  const countStartRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (phase !== "typing") return;
    if (typedLen >= NAME_PREFIX.length) {
      setPhase("counting");
      return;
    }
    const t = window.setTimeout(() => setTypedLen((n) => n + 1), TYPING_MS);
    return () => clearTimeout(t);
  }, [phase, typedLen]);

  useEffect(() => {
    if (phase !== "counting") return;

    let cancelled = false;
    countStartRef.current = null;

    const tick = (now: number) => {
      if (cancelled) return;
      if (countStartRef.current === null) countStartRef.current = now;
      const elapsed = now - countStartRef.current;
      const tLinear = Math.min(1, elapsed / COUNT_DURATION_MS);
      const t = easeOutCubic(tLinear);
      const next = Math.min(98, Math.floor(t * 98));
      setCount(next);

      if (next >= 98) {
        countStartRef.current = null;
        setPhase("hold");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "hold") return;
    const t = window.setTimeout(() => setPhase("fade"), HOLD_AT_END_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const dismissedRef = useRef(false);
  const finish = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setPhase("done");
  }, []);

  useEffect(() => {
    if (phase !== "fade") return;
    const t = window.setTimeout(finish, FADE_MS + 80);
    return () => clearTimeout(t);
  }, [phase, finish]);

  if (phase === "done") return null;

  const showNumber = phase !== "typing";

  return (
    <div
      className="h1 fixed inset-0 z-[var(--z-site-intro)]"
      style={{
        backgroundColor: "var(--color-background)",
        opacity: phase === "fade" ? 0 : 1,
        transition: phase === "fade" ? `opacity ${FADE_MS}ms ease` : undefined,
        pointerEvents: phase === "fade" ? "none" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onTransitionEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.propertyName === "opacity" && phase === "fade") finish();
      }}
      aria-hidden={phase === "fade"}
    >
      <div
        className="flex items-center gap-0"
        style={{
          position: "absolute",
          top: "var(--padding-base)",
          left: "var(--padding-base)",
          color: "rgb(186, 186, 186)",
        }}
      >
        <span className="inline-flex">
          {NAME_PREFIX.slice(0, typedLen).split("").map((ch, i) => (
            <span
              key={i}
              className="inline"
              style={{
                animation: "project-title-letter 0.32s ease forwards",
              }}
            >
              {ch}
            </span>
          ))}
        </span>
        {showNumber && <span>{count}</span>}
      </div>
    </div>
  );
}
