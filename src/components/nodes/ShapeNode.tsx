"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import type { DiagramNode } from "@/types/diagram";
import { renderGeometry } from "@/lib/shape-geometry";
import { dashArray } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { ConnectHandles } from "./handles";
import { ConnectArrows } from "./ConnectArrows";

function ShapeNodeImpl({ id, data, selected, width, height }: NodeProps<DiagramNode>) {
  const w = width ?? 140;
  const h = height ?? 70;
  const s = data.style;
  const updateNodeData = useEditorStore((st) => st.updateNodeData);
  const { editing, draft, setDraft, start, commit, onKeyDown, ref } =
    useInlineEdit(data.label, (label) => updateNodeData(id, { label }));

  const isText = data.shape === "text";
  const rotation = data.rotation ?? 0;

  return (
    <div
      className="vraw-shape-body relative"
      style={{
        width: w,
        height: h,
        opacity: s.opacity,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        filter: s.shadow ? "drop-shadow(0 6px 10px rgba(0,0,0,0.18))" : undefined,
      }}
      onDoubleClick={start}
    >
      <NodeResizer
        isVisible={selected && !data.locked}
        minWidth={28}
        minHeight={24}
        keepAspectRatio={data.shape === "circle"}
      />
      {!isText && (
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="absolute inset-0 overflow-visible"
        >
          {renderGeometry(data.shape, {
            w,
            h,
            fill: s.fill,
            stroke: s.stroke,
            strokeWidth: s.strokeWidth,
            dash: dashArray(s.strokeStyle, s.strokeWidth),
            radius: s.borderRadius,
          })}
        </svg>
      )}

      <div
        className="absolute inset-0 flex items-center px-2 py-1"
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
              textAlign: s.textAlign,
            }}
          />
        ) : (
          <span
            className="pointer-events-none whitespace-pre-wrap break-words leading-tight"
            style={{
              fontSize: s.fontSize,
              color: s.fontColor,
              fontWeight: s.fontWeight,
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

export const ShapeNode = memo(ShapeNodeImpl);
