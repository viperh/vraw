"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import type { DiagramNode } from "@/types/diagram";
import { useEditorStore } from "@/stores/editor-store";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { measureTextWidth } from "@/hooks/use-auto-size";
import { ConnectHandles } from "./handles";
import { ConnectArrows } from "./ConnectArrows";

function ErEntityNodeImpl({ id, data, selected, width, height }: NodeProps<DiagramNode>) {
  const s = data.style;
  const updateNodeData = useEditorStore((st) => st.updateNodeData);
  const grow = useEditorStore((st) => st.growNode);
  const { editing, draft, setDraft, start, commit, onKeyDown, ref } =
    useInlineEdit(data.label, (label) => updateNodeData(id, { label }));
  const cols = data.columns ?? [];
  const contentRef = useRef<HTMLDivElement>(null);

  // Widen the table so neither the title nor any column row is clipped.
  let contentW = measureTextWidth(data.label, {
    fontSize: s.fontSize,
    fontWeight: 600,
    italic: s.italic,
  }) + 20;
  for (const c of cols) {
    const nameW = measureTextWidth(c.name, { fontSize: 12, fontWeight: 400, family: "mono" });
    const typeW = measureTextWidth(c.type, { fontSize: 11, fontWeight: 400, family: "mono" });
    contentW = Math.max(contentW, 16 + 28 + 8 + nameW + 8 + typeW + 6);
  }

  // The box is a fixed, freely-resizable rectangle (like the basic shapes); we
  // only auto-grow it so the title and every column row stay visible. The user
  // can still drag it larger and that size sticks.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const naturalH = el.scrollHeight + 2;
    const curW = width ?? 200;
    const curH = height ?? 150;
    const targetW = Math.min(520, Math.max(curW, contentW, 140));
    const targetH = Math.max(curH, naturalH, 60);
    if (targetW > curW + 0.5 || targetH > curH + 0.5) grow(id, targetW, targetH);
  }, [id, contentW, width, height, cols.length, s.fontSize, grow]);

  return (
    <div
      className="vraw-shape-body relative flex flex-col overflow-hidden"
      style={{
        width: width ?? 200,
        height: height ?? 150,
        background: s.fill,
        border: `${s.strokeWidth}px ${s.strokeStyle} ${s.stroke}`,
        borderRadius: 6,
        opacity: s.opacity,
        boxShadow: s.shadow ? "0 6px 14px rgba(0,0,0,0.18)" : undefined,
      }}
      onDoubleClick={start}
    >
      <NodeResizer isVisible={selected && !data.locked} minWidth={140} minHeight={60} />

      <div ref={contentRef} className="flex flex-col">
      <div
        className="border-b px-2 py-1 text-center font-semibold"
        style={{
          borderColor: s.stroke,
          color: s.fontColor,
          background: "color-mix(in srgb, currentColor 6%, transparent)",
        }}
      >
        {editing ? (
          <input
            ref={ref}
            className="vraw-node-input nodrag text-center font-semibold"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            style={{
              fontSize: s.fontSize,
              fontStyle: s.italic ? "italic" : "normal",
              textDecoration: s.underline ? "underline" : "none",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: s.fontSize,
              fontStyle: s.italic ? "italic" : "normal",
              textDecoration: s.underline ? "underline" : "none",
            }}
          >
            {data.label}
          </span>
        )}
      </div>

      <div className="py-[2px] text-[12px]" style={{ color: s.fontColor }}>
        {cols.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 px-2 py-[2px]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span
              className="w-7 shrink-0 text-[10px] font-bold"
              style={{
                color:
                  c.key === "PK"
                    ? "#d97706"
                    : c.key === "FK"
                      ? "#2563eb"
                      : "transparent",
              }}
            >
              {c.key ?? ""}
            </span>
            <span
              className={c.key === "PK" ? "underline" : ""}
              style={{ flex: 1 }}
            >
              {c.name}
            </span>
            <span className="text-[11px] opacity-60">{c.type}</span>
          </div>
        ))}
        {!cols.length && (
          <div className="px-2 py-1 text-[11px] italic opacity-40">no columns</div>
        )}
      </div>
      </div>

      <ConnectHandles />
      <ConnectArrows id={id} selected={!!selected} />
    </div>
  );
}

export const ErEntityNode = memo(ErEntityNodeImpl);
