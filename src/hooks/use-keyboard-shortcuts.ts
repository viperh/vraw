"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";

interface Options {
  onCommandPalette: () => void;
  onSave: () => void;
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    el.isContentEditable === true
  );
}

/** Global editor keyboard map. Skips events originating from text fields. */
export function useKeyboardShortcuts({ onCommandPalette, onSave }: Options) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      const s = useEditorStore.getState();

      // Command palette works even while typing elsewhere.
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onCommandPalette();
        return;
      }
      if (isTyping(e.target)) return;

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        s.undo();
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        s.redo();
      } else if (mod && e.key.toLowerCase() === "c") {
        s.copySelection();
      } else if (mod && e.key.toLowerCase() === "v") {
        s.paste();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        s.duplicateSelected();
      } else if (mod && e.key.toLowerCase() === "a") {
        e.preventDefault();
        s.selectAll();
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      } else if (mod && e.key.toLowerCase() === "l") {
        e.preventDefault();
        s.toggleLockSelected();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        s.deleteSelected();
      } else if (e.key === "Escape") {
        if (useUiStore.getState().connect) useUiStore.getState().cancelConnect();
        else s.clearSelection();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCommandPalette, onSave]);
}
