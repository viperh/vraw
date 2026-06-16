"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import type { DiagramNode } from "@/types/diagram";
import { useEditorStore } from "@/stores/editor-store";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { measureTextWidth, useAutoWidth } from "@/hooks/use-auto-size";
import { ConnectHandles } from "./handles";
import { ConnectArrows } from "./ConnectArrows";

/** UML "stick figure" actor with an editable name beneath it. */
function ActorNodeImpl({ id, data, selected, width, height }: NodeProps<DiagramNode>) {
  const s = data.style;
  const w = width ?? 70;
  const h = height ?? 110;
  const updateNodeData = useEditorStore((st) => st.updateNodeData);
  const { editing, draft, setDraft, start, commit, onKeyDown, ref } =
    useInlineEdit(data.label, (label) => updateNodeData(id, { label }));
  const figH = h - 22;

  const nameW =
    measureTextWidth(data.label, {
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      italic: s.italic,
    }) + 12;
  useAutoWidth(id, width, nameW, 40, 240);

  return (
    <div
      className="vraw-shape-body relative flex flex-col items-center"
      style={{ width: w, height: h, opacity: s.opacity }}
      onDoubleClick={start}
    >
      <NodeResizer
        isVisible={selected && !data.locked}
        minWidth={40}
        minHeight={70}
        keepAspectRatio
      />
      <svg width={w} height={figH} viewBox="0 0 60 90" preserveAspectRatio="xMidYMid meet">
        <g
          fill="none"
          stroke={s.stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
        >
          <circle cx={30} cy={14} r={10} fill={s.fill} />
          <line x1={30} y1={24} x2={30} y2={58} />
          <line x1={10} y1={38} x2={50} y2={38} />
          <line x1={30} y1={58} x2={14} y2={84} />
          <line x1={30} y1={58} x2={46} y2={84} />
        </g>
      </svg>
      <div className="w-full text-center" style={{ color: s.fontColor }}>
        {editing ? (
          <input
            ref={ref}
            className="vraw-node-input nodrag text-center"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            style={{
              fontSize: s.fontSize,
              fontWeight: s.fontWeight,
              fontStyle: s.italic ? "italic" : "normal",
              textDecoration: s.underline ? "underline" : "none",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: s.fontSize,
              fontWeight: s.fontWeight,
              fontStyle: s.italic ? "italic" : "normal",
              textDecoration: s.underline ? "underline" : "none",
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

export const ActorNode = memo(ActorNodeImpl);
