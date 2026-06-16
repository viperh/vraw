import type { ReactElement } from "react";
import type { ShapeKind } from "@/types/diagram";

export interface GeometryProps {
  w: number;
  h: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  dash?: string;
  radius: number;
}

const poly = (pts: Array<[number, number]>) =>
  pts.map(([x, y]) => `${x},${y}`).join(" ");

/**
 * Returns the SVG body for a given shape, drawn to fill a `w` x `h` box.
 * Network and BPMN shapes reuse base outlines plus a recognisable glyph.
 */
export function renderGeometry(
  shape: ShapeKind,
  p: GeometryProps,
): ReactElement {
  const { w, h, fill, stroke, strokeWidth: sw, dash, radius } = p;
  const common = {
    fill,
    stroke,
    strokeWidth: sw,
    strokeDasharray: dash,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const line = {
    stroke,
    strokeWidth: sw,
    fill: "none",
    vectorEffect: "non-scaling-stroke" as const,
  };
  const cx = w / 2;
  const cy = h / 2;
  const m = Math.min(w, h);

  switch (shape) {
    case "rectangle":
    case "square":
    case "process":
    case "text":
    case "note":
    case "bpmn-pool":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} />
          {shape === "bpmn-pool" && (
            <line x1={w * 0.12} y1={0} x2={w * 0.12} y2={h} {...line} />
          )}
        </g>
      );

    case "rounded-rectangle":
    case "terminator":
    case "bpmn-task":
      return (
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          rx={shape === "terminator" ? h / 2 : radius}
          ry={shape === "terminator" ? h / 2 : radius}
          {...common}
        />
      );

    case "circle":
    case "connector":
    case "er-disjoint":
    case "er-overlapping":
    case "er-union": {
      const r = m / 2;
      return <ellipse cx={cx} cy={cy} rx={r} ry={r} {...common} />;
    }
    case "ellipse":
    case "use-case":
    case "er-attribute":
    case "er-key-attribute":
    case "er-derived-attribute":
      return <ellipse cx={cx} cy={cy} rx={cx} ry={cy} {...common} />;

    case "er-multivalued-attribute":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={cx} ry={cy} {...common} />
          <ellipse cx={cx} cy={cy} rx={cx - 5} ry={cy - 5} fill="none" stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
        </g>
      );

    case "triangle":
      return <polygon points={poly([[cx, 0], [w, h], [0, h]])} {...common} />;
    case "right-triangle":
      return <polygon points={poly([[0, 0], [0, h], [w, h]])} {...common} />;
    case "merge":
    case "er-isa":
      return <polygon points={poly([[0, 0], [w, 0], [cx, h]])} {...common} />;
    case "er-half-circle":
      // Open "C" / subset symbol (⊂) — bows left, open on the right.
      return (
        <path
          d={`M${w},${h * 0.16} A${cx},${cy} 0 1 0 ${w},${h * 0.84}`}
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
          strokeDasharray={dash}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      );

    case "diamond":
    case "rhombus":
    case "decision":
    case "er-relationship":
    case "bpmn-gateway":
    case "bpmn-gateway-parallel":
    case "bpmn-gateway-exclusive": {
      const diamond = poly([[cx, 0], [w, cy], [cx, h], [0, cy]]);
      return (
        <g>
          <polygon points={diamond} {...common} />
          {shape === "bpmn-gateway-parallel" && (
            <path d={`M${cx},${cy - m * 0.22} v${m * 0.44} M${cx - m * 0.22},${cy} h${m * 0.44}`} {...line} strokeWidth={sw + 1} />
          )}
          {shape === "bpmn-gateway-exclusive" && (
            <path
              d={`M${cx - m * 0.16},${cy - m * 0.16} l${m * 0.32},${m * 0.32} M${cx + m * 0.16},${cy - m * 0.16} l${-m * 0.32},${m * 0.32}`}
              {...line}
              strokeWidth={sw + 1}
            />
          )}
        </g>
      );
    }

    case "er-identifying-relationship": {
      const o = poly([[cx, 0], [w, cy], [cx, h], [0, cy]]);
      const i = 6;
      const inner = poly([[cx, i], [w - i, cy], [cx, h - i], [i, cy]]);
      return (
        <g>
          <polygon points={o} {...common} />
          <polygon points={inner} fill="none" stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
        </g>
      );
    }

    case "er-weak-entity": {
      const i = 5;
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} />
          <rect x={i} y={i} width={w - i * 2} height={h - i * 2} fill="none" stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
        </g>
      );
    }

    case "hexagon": {
      const i = w * 0.25;
      return (
        <polygon points={poly([[i, 0], [w - i, 0], [w, cy], [w - i, h], [i, h], [0, cy]])} {...common} />
      );
    }
    case "preparation": {
      const i = w * 0.15;
      return (
        <polygon points={poly([[i, 0], [w - i, 0], [w, cy], [w - i, h], [i, h], [0, cy]])} {...common} />
      );
    }
    case "pentagon":
      return (
        <polygon points={poly([[cx, 0], [w, h * 0.38], [w * 0.82, h], [w * 0.18, h], [0, h * 0.38]])} {...common} />
      );
    case "octagon": {
      const c = m * 0.29;
      return (
        <polygon
          points={poly([[c, 0], [w - c, 0], [w, c], [w, h - c], [w - c, h], [c, h], [0, h - c], [0, c]])}
          {...common}
        />
      );
    }

    case "parallelogram": {
      const s = w * 0.22;
      return <polygon points={poly([[s, 0], [w, 0], [w - s, h], [0, h]])} {...common} />;
    }
    case "trapezoid": {
      const s = w * 0.22;
      return <polygon points={poly([[s, 0], [w - s, 0], [w, h], [0, h]])} {...common} />;
    }
    case "manual-operation": {
      const s = w * 0.18;
      return <polygon points={poly([[0, 0], [w, 0], [w - s, h], [s, h]])} {...common} />;
    }
    case "input-output":
      return <polygon points={poly([[w * 0.18, 0], [w, 0], [w * 0.82, h], [0, h]])} {...common} />;
    case "card": {
      const c = m * 0.28;
      return <polygon points={poly([[c, 0], [w, 0], [w, h], [0, h], [0, c]])} {...common} />;
    }
    case "loop-limit": {
      const c = m * 0.28;
      return (
        <polygon points={poly([[c, 0], [w - c, 0], [w, c], [w, h], [0, h], [0, c]])} {...common} />
      );
    }
    case "off-page-connector":
      return (
        <polygon points={poly([[0, 0], [w, 0], [w, h * 0.62], [cx, h], [0, h * 0.62]])} {...common} />
      );

    case "star": {
      const pts: Array<[number, number]> = [];
      const outer = m / 2;
      const inner = outer * 0.42;
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return <polygon points={poly(pts)} {...common} />;
    }
    case "cross": {
      const t = m / 3;
      return (
        <polygon
          points={poly([
            [cx - t / 2, 0], [cx + t / 2, 0], [cx + t / 2, cy - t / 2],
            [w, cy - t / 2], [w, cy + t / 2], [cx + t / 2, cy + t / 2],
            [cx + t / 2, h], [cx - t / 2, h], [cx - t / 2, cy + t / 2],
            [0, cy + t / 2], [0, cy - t / 2], [cx - t / 2, cy - t / 2],
          ])}
          {...common}
        />
      );
    }
    case "arrow-block": {
      const head = w * 0.4;
      const tail = h * 0.28;
      return (
        <polygon
          points={poly([
            [0, tail], [w - head, tail], [w - head, 0], [w, cy],
            [w - head, h], [w - head, h - tail], [0, h - tail],
          ])}
          {...common}
        />
      );
    }
    case "callout": {
      const r = Math.min(radius, 12);
      const bodyH = h * 0.78;
      return (
        <path
          d={`M${r},0 H${w - r} Q${w},0 ${w},${r} V${bodyH - r} Q${w},${bodyH} ${w - r},${bodyH}
            H${w * 0.4} L${w * 0.25},${h} L${w * 0.3},${bodyH} H${r} Q0,${bodyH} 0,${bodyH - r} V${r} Q0,0 ${r},0 Z`}
          {...common}
        />
      );
    }

    case "cylinder":
    case "database": {
      const ry = Math.min(h * 0.16, 18);
      return (
        <path
          d={`M0,${ry} A${cx},${ry} 0 0 1 ${w},${ry} V${h - ry} A${cx},${ry} 0 0 1 0,${h - ry} Z M0,${ry} A${cx},${ry} 0 0 0 ${w},${ry}`}
          {...common}
        />
      );
    }
    case "direct-data": {
      // horizontal cylinder (disk)
      const rx = Math.min(w * 0.16, 18);
      return (
        <path
          d={`M${rx},0 A${rx},${cy} 0 0 0 ${rx},${h} H${w - rx} A${rx},${cy} 0 0 0 ${w - rx},0 Z M${w - rx},0 A${rx},${cy} 0 0 1 ${w - rx},${h}`}
          {...common}
        />
      );
    }
    case "stored-data": {
      const rx = w * 0.16;
      return (
        <path
          d={`M${rx},0 H${w} A${rx},${cy} 0 0 0 ${w},${h} H${rx} A${rx},${cy} 0 0 1 ${rx},0 Z`}
          {...common}
        />
      );
    }
    case "internal-storage":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} />
          <line x1={w * 0.18} y1={0} x2={w * 0.18} y2={h} {...line} />
          <line x1={0} y1={h * 0.28} x2={w} y2={h * 0.28} {...line} />
        </g>
      );

    case "document": {
      const wave = h * 0.16;
      return (
        <path
          d={`M0,0 H${w} V${h - wave} Q${w * 0.75},${h - wave * 2.4} ${cx},${h - wave} T0,${h - wave} Z`}
          {...common}
        />
      );
    }
    case "multi-document": {
      const off = m * 0.1;
      const wave = h * 0.14;
      const docPath = (ox: number, oy: number) =>
        `M${ox},${oy} H${ox + (w - off * 2)} V${oy + (h - off * 2) - wave} Q${ox + (w - off * 2) * 0.75},${oy + (h - off * 2) - wave * 2.4} ${ox + (w - off * 2) / 2},${oy + (h - off * 2) - wave} T${ox},${oy + (h - off * 2) - wave} Z`;
      return (
        <g>
          <path d={docPath(off * 2, 0)} {...common} />
          <path d={docPath(off, off)} {...common} />
          <path d={docPath(0, off * 2)} {...common} />
        </g>
      );
    }
    case "tape": {
      const wave = h * 0.14;
      return (
        <path
          d={`M0,${wave} Q${w * 0.25},0 ${cx},${wave} T${w},${wave} V${h - wave} Q${w * 0.75},${h} ${cx},${h - wave} T0,${h - wave} Z`}
          {...common}
        />
      );
    }
    case "display":
      return (
        <path
          d={`M0,${cy} L${w * 0.18},0 H${w * 0.78} Q${w},0 ${w},${cy} Q${w},${h} ${w * 0.78},${h} H${w * 0.18} Z`}
          {...common}
        />
      );
    case "bpmn-data-object": {
      const f = w * 0.26;
      return (
        <g>
          <polygon points={poly([[0, 0], [w - f, 0], [w, f], [w, h], [0, h]])} {...common} />
          <polyline points={poly([[w - f, 0], [w - f, f], [w, f]])} {...line} />
        </g>
      );
    }

    case "predefined-process":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} />
          <line x1={w * 0.12} y1={0} x2={w * 0.12} y2={h} {...line} />
          <line x1={w * 0.88} y1={0} x2={w * 0.88} y2={h} {...line} />
        </g>
      );

    case "manual-input":
      return <polygon points={poly([[0, h * 0.25], [w, 0], [w, h], [0, h]])} {...common} />;

    case "delay":
      return (
        <path d={`M0,0 H${w * 0.7} A${h / 2},${h / 2} 0 0 1 ${w * 0.7},${h} H0 Z`} {...common} />
      );

    case "or-junction":
      return (
        <g>
          <circle cx={cx} cy={cy} r={m / 2} {...common} />
          <path d={`M${cx},${cy - m / 2} v${m} M${cx - m / 2},${cy} h${m}`} {...line} />
        </g>
      );
    case "summing-junction": {
      const d = (m / 2) * 0.707;
      return (
        <g>
          <circle cx={cx} cy={cy} r={m / 2} {...common} />
          <path d={`M${cx - d},${cy - d} l${d * 2},${d * 2} M${cx + d},${cy - d} l${-d * 2},${d * 2}`} {...line} />
        </g>
      );
    }

    case "initial-node":
      return <circle cx={cx} cy={cy} r={m / 2} fill={fill} stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />;
    case "final-node":
      return (
        <g>
          <circle cx={cx} cy={cy} r={m / 2} fill="none" stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
          <circle cx={cx} cy={cy} r={m / 2 - Math.max(5, m * 0.22)} fill={stroke} stroke="none" />
        </g>
      );
    case "fork-join":
      return <rect x={0} y={0} width={w} height={h} rx={2} fill={fill} stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />;

    case "bpmn-start-event":
      return <circle cx={cx} cy={cy} r={m / 2} {...common} />;
    case "bpmn-end-event":
      return <circle cx={cx} cy={cy} r={m / 2} fill={fill} stroke={stroke} strokeWidth={Math.max(sw, 3.5)} vectorEffect="non-scaling-stroke" />;
    case "bpmn-intermediate-event":
      return (
        <g>
          <circle cx={cx} cy={cy} r={m / 2} {...common} />
          <circle cx={cx} cy={cy} r={m / 2 - 4} fill="none" stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
        </g>
      );

    case "uml-package": {
      const tabW = w * 0.4;
      const tabH = Math.min(h * 0.2, 22);
      return (
        <g>
          <rect x={0} y={0} width={tabW} height={tabH} {...common} />
          <rect x={0} y={tabH} width={w} height={h - tabH} {...common} />
        </g>
      );
    }
    case "uml-component": {
      const bw = w * 0.16;
      const bh = h * 0.16;
      return (
        <g>
          <rect x={bw / 2} y={0} width={w - bw / 2} height={h} {...common} />
          <rect x={0} y={h * 0.22} width={bw} height={bh} {...common} />
          <rect x={0} y={h * 0.62} width={bw} height={bh} {...common} />
        </g>
      );
    }
    case "uml-node": {
      const d = m * 0.18;
      return (
        <g>
          <polygon points={poly([[0, d], [d, 0], [w, 0], [w - d, d]])} {...common} />
          <polygon points={poly([[w - d, d], [w, 0], [w, h - d], [w - d, h]])} {...common} />
          <rect x={0} y={d} width={w - d} height={h - d} {...common} />
        </g>
      );
    }
    case "uml-object":
      return <rect x={0} y={0} width={w} height={h} {...common} />;

    // --- Network glyphs: rounded box + simple icon ---
    case "router":
    case "switch":
    case "firewall":
    case "server":
    case "client-device":
    case "load-balancer":
    case "hub":
    case "access-point":
    case "mobile":
    case "printer":
    case "workstation":
    case "laptop":
    case "storage":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} rx={8} ry={8} {...common} />
          {networkGlyph(shape, w, h, stroke)}
        </g>
      );

    case "cloud":
    case "cloud-network": {
      const d = `M${w * 0.25},${h * 0.85}
        a${w * 0.18},${h * 0.22} 0 0 1 -${w * 0.06},-${h * 0.42}
        a${w * 0.2},${h * 0.28} 0 0 1 ${w * 0.28},-${h * 0.22}
        a${w * 0.2},${h * 0.26} 0 0 1 ${w * 0.36},${h * 0.04}
        a${w * 0.16},${h * 0.24} 0 0 1 ${w * 0.04},${h * 0.5}
        Z`;
      return <path d={d} {...common} />;
    }

    default:
      return <rect x={0} y={0} width={w} height={h} rx={radius} {...common} />;
  }
}

function networkGlyph(
  shape: ShapeKind,
  w: number,
  h: number,
  stroke: string,
): ReactElement {
  const g = { stroke, strokeWidth: 2, fill: "none", vectorEffect: "non-scaling-stroke" as const };
  const cx = w / 2;
  const cy = h / 2 - 4;
  switch (shape) {
    case "router":
      return (
        <g {...g}>
          <circle cx={cx} cy={cy} r={9} />
          <path d={`M${cx - 5},${cy} h10 M${cx},${cy - 5} v10`} />
        </g>
      );
    case "switch":
      return (
        <g {...g}>
          <rect x={cx - 12} y={cy - 6} width={24} height={12} rx={2} />
          <path d={`M${cx - 7},${cy - 1} h14 M${cx - 7},${cy + 2} h14`} />
        </g>
      );
    case "hub":
      return (
        <g {...g}>
          <circle cx={cx} cy={cy} r={9} />
          <path d={`M${cx},${cy - 9} v18 M${cx - 9},${cy} h18 M${cx - 6},${cy - 6} l12,12 M${cx + 6},${cy - 6} l-12,12`} />
        </g>
      );
    case "load-balancer":
      return (
        <g {...g}>
          <circle cx={cx} cy={cy} r={9} />
          <path d={`M${cx},${cy + 5} v-10 M${cx},${cy - 5} l-3,3 M${cx},${cy - 5} l3,3`} />
        </g>
      );
    case "firewall":
      return (
        <g {...g}>
          <path d={`M${cx - 10},${cy - 8} h20 v16 h-20 z`} />
          <path d={`M${cx},${cy - 8} v16 M${cx - 10},${cy} h20 M${cx - 5},${cy - 8} v8 M${cx + 5},${cy} v8`} />
        </g>
      );
    case "server":
    case "storage":
      return (
        <g {...g}>
          <rect x={cx - 9} y={cy - 9} width={18} height={18} rx={2} />
          <path d={`M${cx - 9},${cy - 3} h18 M${cx - 9},${cy + 3} h18`} />
        </g>
      );
    case "access-point":
      return (
        <g {...g}>
          <circle cx={cx} cy={cy + 4} r={3} />
          <path d={`M${cx - 7},${cy - 2} a7,7 0 0 1 14,0 M${cx - 11},${cy - 5} a11,11 0 0 1 22,0`} />
        </g>
      );
    case "mobile":
      return (
        <g {...g}>
          <rect x={cx - 6} y={cy - 10} width={12} height={20} rx={2} />
          <path d={`M${cx - 2},${cy + 7} h4`} />
        </g>
      );
    case "printer":
      return (
        <g {...g}>
          <path d={`M${cx - 8},${cy - 2} v-7 h16 v7`} />
          <rect x={cx - 11} y={cy - 2} width={22} height={9} rx={1} />
          <rect x={cx - 6} y={cy + 4} width={12} height={7} />
        </g>
      );
    case "workstation":
      return (
        <g {...g}>
          <rect x={cx - 11} y={cy - 9} width={22} height={15} rx={1} />
          <path d={`M${cx - 5},${cy + 10} h10 M${cx},${cy + 6} v4`} />
        </g>
      );
    case "laptop":
      return (
        <g {...g}>
          <rect x={cx - 9} y={cy - 8} width={18} height={12} rx={1} />
          <path d={`M${cx - 13},${cy + 8} h26`} />
        </g>
      );
    case "client-device":
      return (
        <g {...g}>
          <rect x={cx - 11} y={cy - 8} width={22} height={14} rx={1} />
          <path d={`M${cx - 5},${cy + 9} h10`} />
        </g>
      );
    default:
      return <g />;
  }
}
