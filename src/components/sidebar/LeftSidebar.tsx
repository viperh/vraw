"use client";

import { useMemo, useState } from "react";
import { Search, Shapes, LayoutTemplate, ChevronRight } from "lucide-react";
import { SHAPE_CATEGORIES, type PaletteItem } from "@/lib/shape-catalog";
import { TEMPLATES } from "@/lib/templates";
import { useEditorStore } from "@/stores/editor-store";
import { setDragPayload } from "@/lib/dnd";
import { cn } from "@/lib/utils";
import { ShapePreview } from "./ShapePreview";

function ShapeCell({ item }: { item: PaletteItem }) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => setDragPayload(e, { kind: item.kind, size: item.size })}
      className="group flex cursor-grab flex-col items-center gap-1 rounded-lg border border-transparent p-2 text-muted transition-colors hover:border-border hover:bg-surface-2 active:cursor-grabbing"
      title={`Drag to add ${item.label}`}
    >
      <span className="text-foreground/70 group-hover:text-foreground">
        <ShapePreview kind={item.kind} />
      </span>
      <span className="w-full truncate text-center text-[10px] leading-tight">
        {item.label}
      </span>
    </button>
  );
}

function ShapesTab({ query }: { query: string }) {
  // Every category starts collapsed; a search still reveals matches (see `!q`).
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SHAPE_CATEGORIES.map((c) => [c.id, true])),
  );
  const q = query.trim().toLowerCase();

  const categories = useMemo(() => {
    if (!q) return SHAPE_CATEGORIES;
    return SHAPE_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.filter(
        (i) => i.label.toLowerCase().includes(q) || i.kind.includes(q),
      ),
    })).filter((c) => c.items.length);
  }, [q]);

  if (!categories.length) {
    return (
      <p className="px-3 py-8 text-center text-xs text-muted">
        No shapes match “{query}”.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {categories.map((cat) => {
        const isCollapsed = collapsed[cat.id] && !q;
        return (
          <div key={cat.id}>
            <button
              type="button"
              onClick={() =>
                setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))
              }
              className="flex w-full items-center gap-1 rounded px-1 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted hover:text-foreground"
            >
              <ChevronRight
                size={13}
                className={cn("transition-transform", !isCollapsed && "rotate-90")}
              />
              {cat.label}
              <span className="ml-auto text-[10px] font-normal opacity-60">
                {cat.items.length}
              </span>
            </button>
            {!isCollapsed && (
              <div className="grid grid-cols-3 gap-1 pb-1">
                {cat.items.map((item, i) => (
                  <ShapeCell key={`${item.kind}-${i}`} item={item} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TemplatesTab({ query }: { query: string }) {
  const setGraph = useEditorStore((s) => s.setGraph);
  const newProject = useEditorStore((s) => s.newProject);
  const q = query.trim().toLowerCase();
  const templates = q
    ? TEMPLATES.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.group.toLowerCase().includes(q),
      )
    : TEMPLATES;

  const groups = Array.from(new Set(templates.map((t) => t.group)));

  return (
    <div className="flex flex-col gap-3 p-3">
      {groups.map((group) => (
        <div key={group}>
          <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {group}
          </h4>
          <div className="flex flex-col gap-1">
            {templates
              .filter((t) => t.group === group)
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    const g = t.build();
                    newProject(t.kind, t.name);
                    setGraph(g.nodes, g.edges);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-accent hover:bg-surface-2"
                >
                  <LayoutTemplate size={15} className="shrink-0 text-accent" />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
          </div>
        </div>
      ))}
      {!templates.length && (
        <p className="py-8 text-center text-xs text-muted">No templates found.</p>
      )}
    </div>
  );
}

export function LeftSidebar() {
  const [tab, setTab] = useState<"shapes" | "templates">("shapes");
  const [query, setQuery] = useState("");

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex gap-1 p-2">
        <button
          type="button"
          onClick={() => setTab("shapes")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
            tab === "shapes"
              ? "bg-accent-soft text-accent"
              : "text-muted hover:bg-surface-2",
          )}
        >
          <Shapes size={14} /> Shapes
        </button>
        <button
          type="button"
          onClick={() => setTab("templates")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
            tab === "templates"
              ? "bg-accent-soft text-accent"
              : "text-muted hover:bg-surface-2",
          )}
        >
          <LayoutTemplate size={14} /> Templates
        </button>
      </div>

      <div className="px-2 pb-1">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "shapes" ? "Search shapes…" : "Search templates…"}
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-xs outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "shapes" ? (
          <ShapesTab query={query} />
        ) : (
          <TemplatesTab query={query} />
        )}
      </div>
    </aside>
  );
}
