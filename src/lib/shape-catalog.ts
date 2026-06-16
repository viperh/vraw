import type {
  NodeStyle,
  NodeData,
  ShapeKind,
  DiagramNode,
  ErColumn,
  UmlMember,
} from "@/types/diagram";

export const DEFAULT_NODE_STYLE: NodeStyle = {
  fill: "transparent",
  stroke: "#334155",
  strokeWidth: 2,
  strokeStyle: "solid",
  opacity: 1,
  fontSize: 14,
  fontColor: "#ffffff",
  fontWeight: 500,
  italic: false,
  underline: false,
  textAlign: "center",
  borderRadius: 10,
  shadow: false,
};

/** Which React Flow node renderer handles a given shape. */
export function nodeTypeFor(shape: ShapeKind): string {
  switch (shape) {
    case "uml-class":
    case "uml-interface":
    case "uml-enum":
      return "umlClass";
    case "er-entity":
      return "erEntity";
    case "actor":
      return "actor";
    case "text":
    case "note":
      return "text";
    default:
      return "shape";
  }
}

export interface PaletteItem {
  kind: ShapeKind;
  label: string;
  /** Default size when dropped onto the canvas. */
  size: [number, number];
}

export interface PaletteCategory {
  id: string;
  label: string;
  items: PaletteItem[];
}

export const SHAPE_CATEGORIES: PaletteCategory[] = [
  {
    id: "basic",
    label: "Basic Shapes",
    items: [
      { kind: "rectangle", label: "Rectangle", size: [140, 70] },
      { kind: "rounded-rectangle", label: "Rounded", size: [140, 70] },
      { kind: "square", label: "Square", size: [90, 90] },
      { kind: "circle", label: "Circle", size: [90, 90] },
      { kind: "ellipse", label: "Ellipse", size: [140, 80] },
      { kind: "triangle", label: "Triangle", size: [110, 90] },
      { kind: "right-triangle", label: "Right Triangle", size: [100, 90] },
      { kind: "diamond", label: "Diamond", size: [120, 90] },
      { kind: "rhombus", label: "Rhombus", size: [100, 100] },
      { kind: "pentagon", label: "Pentagon", size: [110, 100] },
      { kind: "hexagon", label: "Hexagon", size: [130, 80] },
      { kind: "octagon", label: "Octagon", size: [100, 100] },
      { kind: "parallelogram", label: "Parallelogram", size: [140, 70] },
      { kind: "trapezoid", label: "Trapezoid", size: [140, 70] },
      { kind: "cylinder", label: "Cylinder", size: [110, 110] },
      { kind: "cloud", label: "Cloud", size: [140, 90] },
      { kind: "star", label: "Star", size: [100, 100] },
      { kind: "cross", label: "Cross", size: [100, 100] },
      { kind: "arrow-block", label: "Arrow", size: [140, 70] },
      { kind: "callout", label: "Callout", size: [150, 100] },
      { kind: "text", label: "Text", size: [120, 40] },
      { kind: "note", label: "Note", size: [150, 90] },
    ],
  },
  {
    id: "flowchart",
    label: "Flowchart",
    items: [
      { kind: "process", label: "Process", size: [150, 70] },
      { kind: "decision", label: "Decision", size: [130, 100] },
      { kind: "terminator", label: "Terminator", size: [140, 60] },
      { kind: "input-output", label: "Data (I/O)", size: [150, 70] },
      { kind: "document", label: "Document", size: [150, 90] },
      { kind: "multi-document", label: "Multi-Document", size: [150, 100] },
      { kind: "manual-input", label: "Manual Input", size: [150, 80] },
      { kind: "manual-operation", label: "Manual Operation", size: [150, 70] },
      { kind: "preparation", label: "Preparation", size: [150, 80] },
      { kind: "predefined-process", label: "Predefined Process", size: [150, 70] },
      { kind: "database", label: "Database", size: [110, 110] },
      { kind: "direct-data", label: "Direct Data", size: [140, 80] },
      { kind: "stored-data", label: "Stored Data", size: [140, 80] },
      { kind: "internal-storage", label: "Internal Storage", size: [120, 90] },
      { kind: "card", label: "Card", size: [130, 80] },
      { kind: "tape", label: "Paper Tape", size: [130, 90] },
      { kind: "display", label: "Display", size: [150, 80] },
      { kind: "delay", label: "Delay", size: [130, 70] },
      { kind: "merge", label: "Merge", size: [90, 80] },
      { kind: "or-junction", label: "Or", size: [56, 56] },
      { kind: "summing-junction", label: "Summing", size: [56, 56] },
      { kind: "loop-limit", label: "Loop Limit", size: [130, 80] },
      { kind: "connector", label: "Connector", size: [56, 56] },
      { kind: "off-page-connector", label: "Off-Page", size: [100, 90] },
    ],
  },
  {
    id: "uml",
    label: "UML",
    items: [
      { kind: "uml-class", label: "Class", size: [200, 140] },
      { kind: "uml-interface", label: "Interface", size: [200, 120] },
      { kind: "uml-enum", label: "Enum", size: [180, 120] },
      { kind: "uml-object", label: "Object", size: [170, 60] },
      { kind: "uml-package", label: "Package", size: [180, 120] },
      { kind: "uml-component", label: "Component", size: [170, 90] },
      { kind: "uml-node", label: "Node", size: [150, 100] },
      { kind: "actor", label: "Actor", size: [70, 110] },
      { kind: "use-case", label: "Use Case", size: [150, 80] },
      { kind: "initial-node", label: "Initial", size: [44, 44] },
      { kind: "final-node", label: "Final", size: [44, 44] },
      { kind: "fork-join", label: "Fork / Join", size: [120, 12] },
    ],
  },
  {
    id: "er",
    label: "Entity Relationship",
    items: [
      { kind: "er-entity", label: "Entity (Table)", size: [200, 150] },
      { kind: "er-weak-entity", label: "Weak Entity", size: [160, 70] },
      { kind: "er-relationship", label: "Relationship", size: [130, 90] },
      { kind: "er-identifying-relationship", label: "Identifying Rel.", size: [140, 100] },
      { kind: "er-attribute", label: "Attribute", size: [120, 60] },
      { kind: "er-key-attribute", label: "Key Attribute", size: [120, 60] },
      { kind: "er-multivalued-attribute", label: "Multivalued", size: [130, 64] },
      { kind: "er-derived-attribute", label: "Derived", size: [120, 60] },
      { kind: "er-isa", label: "Generalization (ISA)", size: [96, 64] },
      { kind: "er-half-circle", label: "Subset arc (⊂)", size: [44, 54] },
      { kind: "er-disjoint", label: "Disjoint (d)", size: [46, 46] },
      { kind: "er-overlapping", label: "Overlapping (o)", size: [46, 46] },
      { kind: "er-union", label: "Union / Category (∪)", size: [46, 46] },
    ],
  },
  {
    id: "bpmn",
    label: "BPMN",
    items: [
      { kind: "bpmn-task", label: "Task", size: [140, 70] },
      { kind: "bpmn-start-event", label: "Start Event", size: [54, 54] },
      { kind: "bpmn-intermediate-event", label: "Intermediate", size: [54, 54] },
      { kind: "bpmn-end-event", label: "End Event", size: [54, 54] },
      { kind: "bpmn-gateway", label: "Gateway", size: [70, 70] },
      { kind: "bpmn-gateway-parallel", label: "Parallel (AND)", size: [70, 70] },
      { kind: "bpmn-gateway-exclusive", label: "Exclusive (XOR)", size: [70, 70] },
      { kind: "bpmn-data-object", label: "Data Object", size: [80, 100] },
      { kind: "bpmn-pool", label: "Pool / Lane", size: [240, 120] },
    ],
  },
  {
    id: "network",
    label: "Network",
    items: [
      { kind: "router", label: "Router", size: [90, 80] },
      { kind: "switch", label: "Switch", size: [90, 80] },
      { kind: "hub", label: "Hub", size: [90, 80] },
      { kind: "firewall", label: "Firewall", size: [90, 80] },
      { kind: "server", label: "Server", size: [90, 80] },
      { kind: "storage", label: "Storage", size: [90, 80] },
      { kind: "load-balancer", label: "Load Balancer", size: [90, 80] },
      { kind: "access-point", label: "Access Point", size: [90, 80] },
      { kind: "cloud-network", label: "Cloud", size: [140, 90] },
      { kind: "client-device", label: "Client", size: [90, 80] },
      { kind: "workstation", label: "Workstation", size: [90, 80] },
      { kind: "laptop", label: "Laptop", size: [90, 80] },
      { kind: "mobile", label: "Mobile", size: [80, 90] },
      { kind: "printer", label: "Printer", size: [90, 80] },
    ],
  },
  {
    id: "mindmap",
    label: "Mind Map",
    items: [
      { kind: "ellipse", label: "Central", size: [150, 70] },
      { kind: "rounded-rectangle", label: "Topic", size: [130, 56] },
      { kind: "callout", label: "Idea", size: [140, 90] },
    ],
  },
];

let counter = 0;
/** Collision-resistant id without relying on Math.random (SSR-safe seeds). */
export function makeId(prefix = "n"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

function defaultUmlMembers(): { attributes: UmlMember[]; methods: UmlMember[] } {
  return {
    attributes: [
      { id: makeId("a"), name: "id: int", visibility: "private" },
      { id: makeId("a"), name: "name: string", visibility: "private" },
    ],
    methods: [
      { id: makeId("m"), name: "save(): void", visibility: "public" },
    ],
  };
}

function defaultColumns(): ErColumn[] {
  return [
    { id: makeId("c"), name: "id", type: "INT", key: "PK" },
    { id: makeId("c"), name: "name", type: "VARCHAR", key: null },
    { id: makeId("c"), name: "created_at", type: "TIMESTAMP", key: null },
  ];
}

function defaultLabel(kind: ShapeKind): string {
  const map: Partial<Record<ShapeKind, string>> = {
    "uml-class": "ClassName",
    "uml-interface": "InterfaceName",
    "uml-enum": "EnumName",
    "er-entity": "Entity",
    "er-isa": "ISA",
    "er-disjoint": "d",
    "er-overlapping": "o",
    "er-union": "∪",
    process: "Process",
    decision: "Decision?",
    terminator: "Start",
    "input-output": "Input",
    text: "Text",
    note: "Note",
    actor: "Actor",
    "use-case": "Use Case",
  };
  if (map[kind]) return map[kind]!;
  return kind
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

/** Builds a fully-formed node payload for a shape kind. */
export function makeNodeData(
  kind: ShapeKind,
  overrides: Partial<NodeData> = {},
): NodeData {
  const style: NodeStyle = { ...DEFAULT_NODE_STYLE };

  if (kind === "text") {
    style.fill = "transparent";
    style.stroke = "transparent";
    style.strokeWidth = 0;
    style.textAlign = "left";
  }
  if (kind === "note") {
    style.fill = "#fef9c3";
    style.stroke = "#eab308";
    style.borderRadius = 2;
    style.textAlign = "left";
    style.fontColor = "#0f172a"; // dark text stays readable on the yellow note
  }
  // Solid control nodes (UML initial/fork-join) render as filled glyphs.
  if (kind === "initial-node" || kind === "fork-join") {
    style.fill = "#334155";
  }
  // Derived attributes use a dashed outline by ER convention.
  if (kind === "er-derived-attribute") {
    style.strokeStyle = "dashed";
  }
  // Specialization constraint circles carry a single italic letter (d / o / ∪).
  if (kind === "er-disjoint" || kind === "er-overlapping" || kind === "er-union") {
    style.italic = kind !== "er-union";
    style.fontWeight = 700;
    style.fontSize = 18;
  }

  const data: NodeData = {
    shape: kind,
    label: defaultLabel(kind),
    style,
    ...overrides,
  };

  if (kind === "uml-class" || kind === "uml-interface" || kind === "uml-enum") {
    const m = defaultUmlMembers();
    data.attributes = data.attributes ?? m.attributes;
    data.methods = data.methods ?? m.methods;
    if (kind === "uml-interface") data.stereotype = "interface";
    if (kind === "uml-enum") {
      data.stereotype = "enumeration";
      data.attributes = [
        { id: makeId("a"), name: "VALUE_A", visibility: "public" },
        { id: makeId("a"), name: "VALUE_B", visibility: "public" },
      ];
      data.methods = [];
    }
  }
  if (kind === "er-entity") {
    data.columns = data.columns ?? defaultColumns();
  }
  // The generalization arc reads as a clean symbol; no caption by default.
  if (kind === "er-half-circle" && overrides.label === undefined) {
    data.label = "";
  }
  return data;
}

/** Creates a positioned React Flow node ready to insert into the store. */
export function createNode(
  kind: ShapeKind,
  position: { x: number; y: number },
  size?: [number, number],
  dataOverrides: Partial<NodeData> = {},
): DiagramNode {
  const [w, h] =
    size ??
    SHAPE_CATEGORIES.flatMap((c) => c.items).find((i) => i.kind === kind)
      ?.size ??
    [140, 70];
  return {
    id: makeId(),
    type: nodeTypeFor(kind),
    position,
    width: w,
    height: h,
    data: makeNodeData(kind, dataOverrides),
  };
}
