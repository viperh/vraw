import { MarkerType, type EdgeMarker } from "@xyflow/react";
import type { ArrowKind } from "@/types/diagram";
import { ShapeNode } from "./ShapeNode";
import { UmlClassNode } from "./UmlClassNode";
import { ErEntityNode } from "./ErEntityNode";
import { ActorNode } from "./ActorNode";
import { TextNode } from "./TextNode";
import { SmartEdge } from "./SmartEdge";

export const nodeTypes = {
  shape: ShapeNode,
  umlClass: UmlClassNode,
  erEntity: ErEntityNode,
  actor: ActorNode,
  text: TextNode,
};

export const edgeTypes = {
  smart: SmartEdge,
};

/** Translate a logical arrow kind into a React Flow marker reference. */
export function arrowMarker(
  kind: ArrowKind,
  color: string,
): EdgeMarker | string | undefined {
  switch (kind) {
    case "none":
      return undefined;
    case "arrow":
      return { type: MarkerType.Arrow, color, width: 18, height: 18 };
    case "triangle":
      return { type: MarkerType.ArrowClosed, color, width: 16, height: 16 };
    case "triangle-open":
      return "url(#vraw-triangle-open)";
    case "diamond":
      return "url(#vraw-diamond)";
    case "diamond-open":
      return "url(#vraw-diamond-open)";
    case "circle":
      return "url(#vraw-circle)";
    default:
      return undefined;
  }
}
