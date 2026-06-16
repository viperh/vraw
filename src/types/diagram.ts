import type { Node, Edge } from "@xyflow/react";

/**
 * Every shape the editor can render. The string value is also used as the
 * geometry key in `lib/shape-geometry.ts`, so keep them in sync.
 */
export type ShapeKind =
  // Basic
  | "rectangle"
  | "rounded-rectangle"
  | "square"
  | "circle"
  | "ellipse"
  | "triangle"
  | "right-triangle"
  | "diamond"
  | "rhombus"
  | "hexagon"
  | "pentagon"
  | "octagon"
  | "parallelogram"
  | "trapezoid"
  | "cylinder"
  | "cloud"
  | "star"
  | "cross"
  | "arrow-block"
  | "callout"
  // Flowchart
  | "process"
  | "decision"
  | "input-output"
  | "document"
  | "multi-document"
  | "database"
  | "direct-data"
  | "stored-data"
  | "internal-storage"
  | "manual-input"
  | "manual-operation"
  | "preparation"
  | "terminator"
  | "delay"
  | "connector"
  | "off-page-connector"
  | "predefined-process"
  | "card"
  | "tape"
  | "display"
  | "merge"
  | "or-junction"
  | "summing-junction"
  | "loop-limit"
  // UML
  | "uml-class"
  | "uml-interface"
  | "uml-enum"
  | "uml-package"
  | "uml-component"
  | "uml-node"
  | "uml-object"
  | "initial-node"
  | "final-node"
  | "fork-join"
  // ER
  | "er-entity"
  | "er-weak-entity"
  | "er-relationship"
  | "er-identifying-relationship"
  | "er-attribute"
  | "er-key-attribute"
  | "er-multivalued-attribute"
  | "er-derived-attribute"
  // BPMN
  | "bpmn-task"
  | "bpmn-start-event"
  | "bpmn-intermediate-event"
  | "bpmn-end-event"
  | "bpmn-gateway"
  | "bpmn-gateway-parallel"
  | "bpmn-gateway-exclusive"
  | "bpmn-data-object"
  | "bpmn-pool"
  // Use case / misc
  | "actor"
  | "use-case"
  | "note"
  | "text"
  | "mindmap"
  // Network
  | "router"
  | "switch"
  | "firewall"
  | "server"
  | "cloud-network"
  | "client-device"
  | "load-balancer"
  | "hub"
  | "access-point"
  | "mobile"
  | "printer"
  | "workstation"
  | "laptop"
  | "storage";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type TextAlign = "left" | "center" | "right";

/** Visual style shared by all node renderers. */
export interface NodeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  fontSize: number;
  fontColor: string;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  textAlign: TextAlign;
  borderRadius: number;
  shadow: boolean;
}

export type UmlVisibility = "public" | "private" | "protected" | "package";

export interface UmlMember {
  id: string;
  name: string;
  visibility: UmlVisibility;
}

/** A column row inside an ER entity. */
export interface ErColumn {
  id: string;
  name: string;
  type: string;
  key?: "PK" | "FK" | null;
}

/** Payload stored on every node. Discriminated by `shape`. */
export interface NodeData extends Record<string, unknown> {
  shape: ShapeKind;
  label: string;
  style: NodeStyle;
  rotation?: number;
  locked?: boolean;
  // UML class / interface / enum
  attributes?: UmlMember[];
  methods?: UmlMember[];
  stereotype?: string;
  // ER entity
  columns?: ErColumn[];
}

export type DiagramNode = Node<NodeData>;

export type EdgeRouting = "default" | "straight" | "step" | "smoothstep";
export type ArrowKind =
  | "none"
  | "arrow"
  | "triangle"
  | "triangle-open"
  | "diamond"
  | "diamond-open"
  | "circle";

export interface EdgeData extends Record<string, unknown> {
  label?: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  routing: EdgeRouting;
  startArrow: ArrowKind;
  endArrow: ArrowKind;
  animated?: boolean;
}

export type DiagramEdge = Edge<EdgeData>;

export type DiagramKind =
  | "flowchart"
  | "uml-class"
  | "uml-sequence"
  | "uml-usecase"
  | "uml-activity"
  | "uml-state"
  | "er"
  | "network"
  | "orgchart"
  | "mindmap"
  | "bpmn"
  | "general";

/** A complete saved diagram document. */
export interface Project {
  id: string;
  name: string;
  kind: DiagramKind;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  createdAt: number;
  updatedAt: number;
}

/** Serialized form written to localStorage / exported as JSON. */
export interface ProjectFile {
  version: 1;
  app: "vraw";
  project: Project;
}
