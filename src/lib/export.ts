import { toPng, toSvg } from "html-to-image";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import type { DiagramNode } from "@/types/diagram";

export type ExportFormat = "png" | "svg" | "pdf";

export interface ExportOptions {
  transparent?: boolean;
  scale?: number; // resolution multiplier
  padding?: number;
  background?: string;
}

const VIEWPORT_SELECTOR = ".react-flow__viewport";

function download(dataUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}

/** Elements (UI chrome) that must not appear in the rendered output. */
function filterChrome(node: HTMLElement): boolean {
  const cls = node.classList;
  if (!cls) return true;
  return !(
    cls.contains("react-flow__minimap") ||
    cls.contains("react-flow__controls") ||
    cls.contains("react-flow__panel") ||
    cls.contains("react-flow__background") ||
    cls.contains("react-flow__handle") ||
    cls.contains("react-flow__resize-control")
  );
}

function computeFit(nodes: DiagramNode[], padding: number) {
  const bounds = getNodesBounds(nodes);
  const width = Math.max(Math.ceil(bounds.width + padding * 2), 64);
  const height = Math.max(Math.ceil(bounds.height + padding * 2), 64);
  const { x, y, zoom } = getViewportForBounds(
    bounds,
    width,
    height,
    0.2,
    4,
    padding / Math.max(bounds.width, bounds.height, 1),
  );
  return { width, height, x, y, zoom };
}

export async function exportDiagram(
  format: ExportFormat,
  nodes: DiagramNode[],
  fileName: string,
  opts: ExportOptions = {},
): Promise<void> {
  const viewport = document.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
  if (!viewport || nodes.length === 0) {
    throw new Error("Nothing to export — the canvas is empty.");
  }

  const padding = opts.padding ?? 48;
  const scale = opts.scale ?? 2;
  const { width, height, x, y, zoom } = computeFit(nodes, padding);
  const bg =
    opts.transparent && format !== "pdf"
      ? undefined
      : opts.background ?? "#ffffff";

  const style = {
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${x}px, ${y}px) scale(${zoom})`,
  };

  if (format === "svg") {
    const dataUrl = await toSvg(viewport, {
      width,
      height,
      backgroundColor: bg,
      filter: filterChrome,
      style,
    });
    download(dataUrl, `${fileName}.svg`);
    return;
  }

  const dataUrl = await toPng(viewport, {
    width,
    height,
    backgroundColor: bg,
    pixelRatio: scale,
    filter: filterChrome,
    style,
  });

  if (format === "png") {
    download(dataUrl, `${fileName}.png`);
    return;
  }

  // PDF: place the rendered PNG onto a correctly-sized page.
  const { jsPDF } = await import("jspdf");
  const orientation = width >= height ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [width, height],
    compress: true,
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
  pdf.save(`${fileName}.pdf`);
}

/** Trigger a browser download of arbitrary text (used for JSON export). */
export function downloadText(text: string, fileName: string, mime = "application/json") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  download(url, fileName);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
