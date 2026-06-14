"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { saveProject } from "@/lib/persistence";

/**
 * Debounced autosave. Persists the project to localStorage ~1.2s after the
 * last change whenever the document is dirty.
 */
export function useAutosave(enabled = true) {
  const dirty = useEditorStore((s) => s.dirty);
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const name = useEditorStore((s) => s.name);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !dirty) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const project = useEditorStore.getState().toProject();
      saveProject(project);
      useEditorStore.getState().markSaved();
    }, 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, dirty, nodes, edges, name]);
}
