"use client";

import { useStore } from "@xyflow/react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";

export function StatusBar() {
  const zoom = useStore((s) => s.transform[2]);
  const cursor = useUiStore((s) => s.cursor);
  const nodeCount = useEditorStore((s) => s.nodes.length);
  const edgeCount = useEditorStore((s) => s.edges.length);
  const selNodes = useEditorStore((s) => s.nodes.filter((n) => n.selected).length);
  const selEdges = useEditorStore((s) => s.edges.filter((e) => e.selected).length);
  const selected = selNodes + selEdges;

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-border bg-surface px-3 text-[11px] text-muted">
      <span className="tabular-nums">Zoom {Math.round((zoom ?? 1) * 100)}%</span>
      <span className="tabular-nums">
        x {cursor.x}, y {cursor.y}
      </span>
      <span>
        {nodeCount} {nodeCount === 1 ? "shape" : "shapes"} · {edgeCount}{" "}
        {edgeCount === 1 ? "connection" : "connections"}
      </span>
      {selected > 0 && (
        <span className="ml-auto text-accent">
          {selected} selected
          {selNodes > 0 && ` · ${selNodes} ${selNodes === 1 ? "shape" : "shapes"}`}
          {selEdges > 0 && ` · ${selEdges} ${selEdges === 1 ? "edge" : "edges"}`}
        </span>
      )}
    </footer>
  );
}
