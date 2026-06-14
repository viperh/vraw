"use client";

import { useMemo, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  Search,
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Maximize,
  Save,
  FilePlus2,
  CheckSquare,
  LayoutTemplate,
  Shapes as ShapesIcon,
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import { SHAPE_CATEGORIES } from "@/lib/shape-catalog";
import { TEMPLATES } from "@/lib/templates";
import { saveProject } from "@/lib/persistence";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  run: () => void;
}

function Palette() {
  const setOpen = useUiStore((s) => s.setPalette);
  const { fitView, screenToFlowPosition } = useReactFlow();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const center = () =>
      screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

    const actions: Command[] = [
      { id: "undo", label: "Undo", group: "Actions", icon: <Undo2 size={15} />, run: () => useEditorStore.getState().undo() },
      { id: "redo", label: "Redo", group: "Actions", icon: <Redo2 size={15} />, run: () => useEditorStore.getState().redo() },
      { id: "dup", label: "Duplicate selection", group: "Actions", icon: <Copy size={15} />, run: () => useEditorStore.getState().duplicateSelected() },
      { id: "del", label: "Delete selection", group: "Actions", icon: <Trash2 size={15} />, run: () => useEditorStore.getState().deleteSelected() },
      { id: "all", label: "Select all", group: "Actions", icon: <CheckSquare size={15} />, run: () => useEditorStore.getState().selectAll() },
      { id: "fit", label: "Fit to screen", group: "Actions", icon: <Maximize size={15} />, run: () => fitView({ padding: 0.3 }) },
      { id: "save", label: "Save project", group: "Actions", icon: <Save size={15} />, run: () => { saveProject(useEditorStore.getState().toProject()); useEditorStore.getState().markSaved(); } },
      { id: "new", label: "New diagram", group: "Actions", icon: <FilePlus2 size={15} />, run: () => useEditorStore.getState().newProject() },
    ];

    const shapes: Command[] = SHAPE_CATEGORIES.flatMap((c) => c.items).map((item) => ({
      id: `shape-${item.kind}-${item.label}`,
      label: `Add ${item.label}`,
      group: "Insert Shape",
      icon: <ShapesIcon size={15} />,
      run: () => {
        const p = center();
        useEditorStore
          .getState()
          .addNode(item.kind, { x: p.x - item.size[0] / 2, y: p.y - item.size[1] / 2 }, item.size);
      },
    }));

    const templates: Command[] = TEMPLATES.map((t) => ({
      id: `tpl-${t.id}`,
      label: `Template: ${t.name}`,
      group: "Templates",
      icon: <LayoutTemplate size={15} />,
      run: () => {
        const g = t.build();
        useEditorStore.getState().newProject(t.kind, t.name);
        useEditorStore.getState().setGraph(g.nodes, g.edges);
        setTimeout(() => fitView({ padding: 0.3 }), 50);
      },
    }));

    return [...actions, ...shapes, ...templates];
  }, [fitView, screenToFlowPosition]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  const runAt = (i: number) => {
    const cmd = filtered[i];
    if (cmd) {
      cmd.run();
      setOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search size={16} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                runAt(active);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
            Esc
          </kbd>
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No results.</p>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => runAt(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
                i === active ? "bg-accent-soft text-accent" : "hover:bg-surface-2",
              )}
            >
              <span className={i === active ? "text-accent" : "text-muted"}>
                {cmd.icon}
              </span>
              <span className="flex-1 truncate">{cmd.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted">
                {cmd.group}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen);
  return open ? <Palette /> : null;
}
