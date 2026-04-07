"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav
      className="bodycopy group fixed left-1/2 z-[11000] -translate-x-1/2"
      style={{
        top: "var(--padding-base)",
      }}
      aria-label="Main navigation"
    >
      <div
        className="flex items-center justify-center gap-10"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0)",
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          borderRadius: "5px",
        }}
      >
        <Link href="/" className="whitespace-nowrap hover:opacity-80">
          LAUREN DAVIS
        </Link>
        <Link href="/overview" className="whitespace-nowrap hover:opacity-80">
          WORK
        </Link>
      </div>
    </nav>
  );
}
