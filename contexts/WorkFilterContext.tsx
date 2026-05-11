"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { WorkTag } from "@/lib/queries";

type WorkFilterContextValue = {
  selectedTags: ReadonlySet<WorkTag>;
  toggleTag: (tag: WorkTag) => void;
  clearFilters: () => void;
  /** True when at least one tag is selected (filter mode). */
  isFiltering: boolean;
};

const WorkFilterContext = createContext<WorkFilterContextValue | null>(null);

export function WorkFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedTags, setSelectedTags] = useState<Set<WorkTag>>(() => new Set());

  const toggleTag = useCallback((tag: WorkTag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedTags(new Set());
  }, []);

  const isFiltering = selectedTags.size > 0;

  const value = useMemo(
    () => ({
      selectedTags,
      toggleTag,
      clearFilters,
      isFiltering,
    }),
    [selectedTags, toggleTag, clearFilters, isFiltering]
  );

  return (
    <WorkFilterContext.Provider value={value}>
      {children}
    </WorkFilterContext.Provider>
  );
}

export function useWorkFilter() {
  const ctx = useContext(WorkFilterContext);
  if (!ctx)
    throw new Error("useWorkFilter must be used within WorkFilterProvider");
  return ctx;
}
