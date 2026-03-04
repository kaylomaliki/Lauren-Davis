"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/sanity.config";

// Prevent hydration mismatch in Sanity Studio
export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <NextStudio config={config} />;
}

