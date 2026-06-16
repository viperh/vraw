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
  if (kind === "er-disjoint" || kind === "er-overlapping" || kind === "er-union") {
    const ch = kind === "er-disjoint" ? "d" : kind === "er-overlapping" ? "o" : "∪";
    return (
      <svg width={size} height={size} viewBox="0 0 30 30">
        <circle cx={15} cy={15} r={11} fill="none" stroke="currentColor" strokeWidth={1.5} />
        <text
          x={15}
          y={15}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontStyle={kind === "er-union" ? "normal" : "italic"}
          fontWeight={700}
          fill="currentColor"
        >
          {ch}
        </text>
      </svg>
    );
  }
  if (kind === "er-isa") {
    return (
      <svg width={size} height={size} viewBox="0 0 30 30">
        <polygon points="4,8 26,8 15,25" fill="none" stroke="currentColor" strokeWidth={1.5} />
        <text x={15} y={13} textAnchor="middle" dominantBaseline="central" fontSize={6.5} fill="currentColor">
          ISA
        </text>
      </svg>
    );
  }
  if (kind === "er-half-circle") {
    return (
      <svg width={size} height={size} viewBox="0 0 30 30">
        <path
          d="M23,5 A11,10 0 1 0 23,25"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
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
