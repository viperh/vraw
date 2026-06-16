"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import type { DiagramEdge, EdgeData } from "@/types/diagram";
import { DEFAULT_EDGE_DATA } from "@/stores/editor-store";
import { dashArray } from "@/lib/utils";

/**
 * Single edge renderer that switches routing algorithm based on
 * `data.routing` and draws configurable start/end markers.
 */
function SmartEdgeImpl(props: EdgeProps<DiagramEdge>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    markerStart,
    data,
    selected,
  } = props;
  const d: EdgeData = data ?? DEFAULT_EDGE_DATA;

  const args = {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  };
  let path: string;
  let labelX: number;
  let labelY: number;
  if (d.routing === "straight") {
    [path, labelX, labelY] = getStraightPath(args);
  } else if (d.routing === "step" || d.routing === "smoothstep") {
    [path, labelX, labelY] = getSmoothStepPath({
      ...args,
      borderRadius: d.routing === "step" ? 0 : 8,
    });
  } else {
    [path, labelX, labelY] = getBezierPath(args);
  }

  // EER total participation: two parallel lines, faked by drawing a wide
  // stroke and overpainting its centre with the canvas colour so a thin gap
  // splits it into two. Partial participation is the normal single line.
  const stroke = selected ? "var(--accent)" : d.stroke;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          stroke,
          strokeWidth: d.doubleLine ? d.strokeWidth * 3 : d.strokeWidth,
          strokeDasharray: dashArray(d.strokeStyle, d.strokeWidth),
        }}
      />
      {d.doubleLine && (
        <path
          d={path}
          fill="none"
          stroke="var(--canvas)"
          strokeWidth={d.strokeWidth}
          style={{ pointerEvents: "none" }}
        />
      )}
      {d.label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute rounded px-1.5 py-0.5 text-[11px]"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          >
            {d.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const SmartEdge = memo(SmartEdgeImpl);
