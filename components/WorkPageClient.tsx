"use client";

import WorkPlusGallery from "@/components/WorkPlusGallery";
import { useWorkFilter } from "@/contexts/WorkFilterContext";
import type { Work } from "@/lib/queries";

interface WorkPageClientProps {
  works: Work[];
}

export default function WorkPageClient({ works }: WorkPageClientProps) {
  const { selectedTags } = useWorkFilter();

  return (
    <WorkPlusGallery works={works} selectedTags={selectedTags} />
  );
}
