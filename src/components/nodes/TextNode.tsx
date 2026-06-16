"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import type { DiagramNode } from "@/types/diagram";
import { useEditorStore } from "@/stores/editor-store";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { useAutoSize } from "@/hooks/use-auto-size";
import { ConnectHandles } from "./handles";
import { ConnectArrows } from "./ConnectArrows";

/** Plain text label and sticky-note nodes. */
function TextNodeImpl({ id, data, selected, width, height }: NodeProps<DiagramNode>) {
  const s = data.style;
  const isNote = data.shape === "note";
  const updateNodeData = useEditorStore((st) => st.updateNodeData);
  const { editing, draft, setDraft, start, commit, onKeyDown, ref } =
    useInlineEdit(data.label, (label) => updateNodeData(id, { label }));

  useAutoSize({
    id,
    text: data.label,
    style: s,
    width,
    height,
    minWidth: isNote ? 80 : 40,
    minHeight: isNote ? 60 : 24,
    padX: 16,
    padY: 16,
    maxWidth: isNote ? 360 : 480,
    lineHeight: 1.375,
  });

  return (
    <div
      className="vraw-shape-body relative"
      style={{
        width: width ?? (isNote ? 150 : 120),
        height: height ?? (isNote ? 90 : 40),
        opacity: s.opacity,
        background: isNote ? s.fill : "transparent",
        border: isNote ? `${s.strokeWidth}px ${s.strokeStyle} ${s.stroke}` : "none",
        borderRadius: isNote ? 2 : 0,
        boxShadow: isNote && s.shadow ? "0 6px 14px rgba(0,0,0,0.18)" : undefined,
      }}
      onDoubleClick={start}
    >
      <NodeResizer isVisible={selected && !data.locked} minWidth={40} minHeight={24} />
      <div
        className="flex h-full w-full items-start p-2"
        style={{
          justifyContent:
            s.textAlign === "left"
              ? "flex-start"
              : s.textAlign === "right"
                ? "flex-end"
                : "center",
        }}
      >
        {editing ? (
          <textarea
            ref={ref}
            className="vraw-node-input nodrag"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            style={{
              fontSize: s.fontSize,
              color: s.fontColor,
              fontWeight: s.fontWeight,
              fontStyle: s.italic ? "italic" : "normal",
              textDecoration: s.underline ? "underline" : "none",
              textAlign: s.textAlign,
              height: "100%",
            }}
          />
        ) : (
          <span
            className="pointer-events-none whitespace-pre-wrap break-words leading-snug"
            style={{
              fontSize: s.fontSize,
              color: s.fontColor,
              fontWeight: s.fontWeight,
              fontStyle: s.italic ? "italic" : "normal",
              textDecoration: s.underline ? "underline" : "none",
              textAlign: s.textAlign,
              width: "100%",
            }}
          >
            {data.label}
          </span>
        )}
      </div>
      <ConnectHandles />
      <ConnectArrows id={id} selected={!!selected} />
    </div>
  );
}

export const TextNode = memo(TextNodeImpl);
