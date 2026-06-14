import type { ShapeKind } from "@/types/diagram";

export const DND_MIME = "application/vraw-shape";

export interface DndPayload {
  kind: ShapeKind;
  size: [number, number];
}

export function setDragPayload(e: React.DragEvent, payload: DndPayload) {
  e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
  e.dataTransfer.effectAllowed = "move";
}

export function readDragPayload(e: React.DragEvent): DndPayload | null {
  const raw = e.dataTransfer.getData(DND_MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DndPayload;
  } catch {
    return null;
  }
}
