"use client";

import type { ShapeKind } from "@/types/diagram";
import { renderGeometry } from "@/lib/shape-geometry";

/** Small monochrome thumbnail of a shape for palettes and menus. */
export function ShapePreview({ kind, size = 30 }: { kind: ShapeKind; size?: number }) {
  // Renderers that are not simple geometry get a representative glyph.
  if (kind === "uml-class" || kind === "uml-interface" || kind === "uml-enum") {
    return (
      <svg width={size} height={size} viewBox="0 0 30 30">
        <rect x={4} y={4} width={22} height={22} rx={2} fill="none" stroke="currentColor" strokeWidth={1.5} />
        <line x1={4} y1={12} x2={26} y2={12} stroke="currentColor" strokeWidth={1.5} />
        <line x1={4} y1={20} x2={26} y2={20} stroke="currentColor" strokeWidth={1.5} />
      </svg>
    );
  }
  if (kind === "er-entity") {
    return (
      <svg width={size} height={size} viewBox="0 0 30 30">
        <rect x={3} y={5} width={24} height={20} rx={2} fill="none" stroke="currentColor" strokeWidth={1.5} />
        <line x1={3} y1={12} x2={27} y2={12} stroke="currentColor" strokeWidth={1.5} />
      </svg>
    );
  }
  if (kind === "actor") {
    return (
      <svg width={size} height={size} viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
        <circle cx={15} cy={7} r={3.5} />
        <line x1={15} y1={11} x2={15} y2={20} />
        <line x1={8} y1={15} x2={22} y2={15} />
        <line x1={15} y1={20} x2={9} y2={27} />
        <line x1={15} y1={20} x2={21} y2={27} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 30 22" className="overflow-visible">
      <g className="text-foreground">
        {renderGeometry(kind, {
          w: 28,
          h: 20,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.5,
          radius: 4,
        })}
      </g>
    </svg>
  );
}
