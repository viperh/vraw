"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import type { DiagramNode } from "@/types/diagram";
import { useEditorStore } from "@/stores/editor-store";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { ConnectHandles } from "./handles";
import { ConnectArrows } from "./ConnectArrows";

function ErEntityNodeImpl({ id, data, selected, width, height }: NodeProps<DiagramNode>) {
  const s = data.style;
  const updateNodeData = useEditorStore((st) => st.updateNodeData);
  const { editing, draft, setDraft, start, commit, onKeyDown, ref } =
    useInlineEdit(data.label, (label) => updateNodeData(id, { label }));
  const cols = data.columns ?? [];

  return (
    <div
      className="vraw-shape-body relative flex flex-col overflow-hidden"
      style={{
        width: width ?? 200,
        minHeight: height ?? 120,
        background: s.fill,
        border: `${s.strokeWidth}px ${s.strokeStyle} ${s.stroke}`,
        borderRadius: 6,
        opacity: s.opacity,
        boxShadow: s.shadow ? "0 6px 14px rgba(0,0,0,0.18)" : undefined,
      }}
      onDoubleClick={start}
    >
      <NodeResizer isVisible={selected && !data.locked} minWidth={140} minHeight={80} />

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
            style={{ fontSize: s.fontSize }}
          />
        ) : (
          <span style={{ fontSize: s.fontSize }}>{data.label}</span>
        )}
      </div>

      <div className="flex-1 py-[2px] text-[12px]" style={{ color: s.fontColor }}>
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

      <ConnectHandles />
      <ConnectArrows id={id} selected={!!selected} />
    </div>
  );
}

export const ErEntityNode = memo(ErEntityNodeImpl);
