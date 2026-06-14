"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Manages double-click-to-edit label state for a node. Commits on blur or
 * Enter, cancels on Escape. The current `value` is owned by the parent; the
 * hook only holds a transient draft while editing.
 */
export function useInlineEdit(
  value: string,
  onCommit: (next: string) => void,
) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const start = useCallback(() => {
    setDraft(value);
    setEditing(true);
  }, [value]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  }, [draft, value, onCommit]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setEditing(false);
      }
      e.stopPropagation();
    },
    [commit],
  );

  return { editing, draft, setDraft, start, commit, onKeyDown, ref };
}
