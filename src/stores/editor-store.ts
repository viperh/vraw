import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import type {
  DiagramEdge,
  DiagramKind,
  DiagramNode,
  EdgeData,
  NodeData,
  NodeStyle,
  Project,
  ShapeKind,
} from "@/types/diagram";
import { createNode, makeId } from "@/lib/shape-catalog";

interface Snapshot {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const DEFAULT_EDGE_DATA: EdgeData = {
  stroke: "#64748b",
  strokeWidth: 2,
  strokeStyle: "solid",
  routing: "smoothstep",
  startArrow: "none",
  endArrow: "arrow",
  animated: false,
};

interface EditorState {
  projectId: string;
  name: string;
  kind: DiagramKind;
  nodes: DiagramNode[];
  edges: DiagramEdge[];

  past: Snapshot[];
  future: Snapshot[];
  clipboard: { nodes: DiagramNode[]; edges: DiagramEdge[] } | null;

  // canvas prefs
  snapToGrid: boolean;
  showGrid: boolean;
  showMinimap: boolean;
  defaultRouting: EdgeData["routing"];

  dirty: boolean;
  _dragging: boolean;

  // --- mutations ---
  onNodesChange: (changes: NodeChange<DiagramNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<DiagramEdge>[]) => void;
  onConnect: (c: Connection) => void;

  addNode: (
    kind: ShapeKind,
    position: { x: number; y: number },
    size?: [number, number],
    data?: Partial<NodeData>,
  ) => string;
  addNodes: (nodes: DiagramNode[]) => void;
  addEdgeFrom: (sourceId: string, sourceHandle: string, targetId: string) => void;

  updateNodeData: (id: string, patch: Partial<NodeData>) => void;
  updateNodeStyle: (ids: string[], patch: Partial<NodeStyle>) => void;
  updateEdgeData: (ids: string[], patch: Partial<EdgeData>) => void;

  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelection: () => void;
  paste: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelected: (nodeIds: string[], edgeIds?: string[]) => void;
  toggleLockSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  alignSelected: (axis: "left" | "centerX" | "right" | "top" | "centerY" | "bottom") => void;
  distributeSelected: (axis: "x" | "y") => void;

  undo: () => void;
  redo: () => void;
  commit: () => void;

  setName: (name: string) => void;
  setPref: (patch: Partial<Pick<EditorState, "snapToGrid" | "showGrid" | "showMinimap" | "defaultRouting">>) => void;

  loadProject: (p: Project) => void;
  newProject: (kind?: DiagramKind, name?: string) => void;
  setGraph: (nodes: DiagramNode[], edges: DiagramEdge[]) => void;
  toProject: () => Project;
  markSaved: () => void;
}

const HISTORY_LIMIT = 100;

function snapshot(s: EditorState): Snapshot {
  return { nodes: s.nodes, edges: s.edges };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: makeId("p"),
  name: "Untitled Diagram",
  kind: "general",
  nodes: [],
  edges: [],
  past: [],
  future: [],
  clipboard: null,
  snapToGrid: true,
  showGrid: true,
  showMinimap: true,
  defaultRouting: "smoothstep",
  dirty: false,
  _dragging: false,

  commit: () =>
    set((s) => ({
      past: [...s.past.slice(-HISTORY_LIMIT + 1), snapshot(s)],
      future: [],
      dirty: true,
    })),

  onNodesChange: (changes) => {
    // Open a history entry once at the start of a drag / resize gesture.
    const dragStart = changes.some(
      (c) => c.type === "position" && c.dragging === true,
    );
    const dragEnd = changes.some(
      (c) => c.type === "position" && c.dragging === false,
    );
    const dimChange = changes.some((c) => c.type === "dimensions" && c.resizing);

    set((s) => {
      let { past, _dragging } = s;
      if ((dragStart || dimChange) && !_dragging) {
        past = [...s.past.slice(-HISTORY_LIMIT + 1), snapshot(s)];
        _dragging = true;
      }
      if (dragEnd) _dragging = false;
      const onlySelection = changes.every((c) => c.type === "select");
      return {
        nodes: applyNodeChanges(changes, s.nodes),
        past,
        future: dragStart || dimChange ? [] : s.future,
        _dragging,
        dirty: onlySelection ? s.dirty : true,
      };
    });
  },

  onEdgesChange: (changes) =>
    set((s) => {
      const onlySelection = changes.every((c) => c.type === "select");
      return {
        edges: applyEdgeChanges(changes, s.edges),
        dirty: onlySelection ? s.dirty : true,
      };
    }),

  onConnect: (c) => {
    get().commit();
    set((s) => ({
      edges: addEdge(
        {
          ...c,
          id: makeId("e"),
          type: "smart",
          data: { ...DEFAULT_EDGE_DATA, routing: s.defaultRouting },
        },
        s.edges,
      ),
    }));
  },

  addNode: (kind, position, size, data) => {
    get().commit();
    const node = createNode(kind, position, size, data);
    set((s) => ({
      nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), { ...node, selected: true }],
    }));
    return node.id;
  },

  addNodes: (nodes) => {
    get().commit();
    set((s) => ({ nodes: [...s.nodes, ...nodes] }));
  },

  addEdgeFrom: (sourceId, sourceHandle, targetId) => {
    if (sourceId === targetId) return;
    const s = get();
    const src = s.nodes.find((n) => n.id === sourceId);
    const tgt = s.nodes.find((n) => n.id === targetId);
    // Choose the target handle facing the source so the edge enters cleanly.
    let targetHandle: "t" | "r" | "b" | "l" = "l";
    if (src && tgt) {
      const sc = {
        x: src.position.x + (src.width ?? 100) / 2,
        y: src.position.y + (src.height ?? 60) / 2,
      };
      const tc = {
        x: tgt.position.x + (tgt.width ?? 100) / 2,
        y: tgt.position.y + (tgt.height ?? 60) / 2,
      };
      const dx = tc.x - sc.x;
      const dy = tc.y - sc.y;
      if (Math.abs(dx) >= Math.abs(dy)) targetHandle = dx >= 0 ? "l" : "r";
      else targetHandle = dy >= 0 ? "t" : "b";
    }
    get().commit();
    set((st) => ({
      edges: [
        ...st.edges,
        {
          id: makeId("e"),
          source: sourceId,
          target: targetId,
          sourceHandle,
          targetHandle,
          type: "smart",
          data: { ...DEFAULT_EDGE_DATA, routing: st.defaultRouting },
        },
      ],
    }));
  },

  updateNodeData: (id, patch) => {
    get().commit();
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    }));
  },

  updateNodeStyle: (ids, patch) => {
    get().commit();
    const set2 = new Set(ids);
    set((s) => ({
      nodes: s.nodes.map((n) =>
        set2.has(n.id)
          ? { ...n, data: { ...n.data, style: { ...n.data.style, ...patch } } }
          : n,
      ),
    }));
  },

  updateEdgeData: (ids, patch) => {
    get().commit();
    const set2 = new Set(ids);
    set((s) => ({
      edges: s.edges.map((e) =>
        set2.has(e.id)
          ? {
              ...e,
              data: { ...(e.data ?? DEFAULT_EDGE_DATA), ...patch },
              animated: patch.animated ?? e.animated,
            }
          : e,
      ),
    }));
  },

  deleteSelected: () => {
    const { nodes, edges } = get();
    if (!nodes.some((n) => n.selected) && !edges.some((e) => e.selected)) return;
    get().commit();
    set((s) => {
      const removed = new Set(s.nodes.filter((n) => n.selected).map((n) => n.id));
      return {
        nodes: s.nodes.filter((n) => !n.selected),
        edges: s.edges.filter(
          (e) => !e.selected && !removed.has(e.source) && !removed.has(e.target),
        ),
      };
    });
  },

  duplicateSelected: () => {
    const sel = get().nodes.filter((n) => n.selected);
    if (!sel.length) return;
    get().commit();
    const idMap = new Map<string, string>();
    const clones = sel.map((n) => {
      const id = makeId();
      idMap.set(n.id, id);
      return {
        ...n,
        id,
        position: { x: n.position.x + 24, y: n.position.y + 24 },
        selected: true,
        data: structuredClone(n.data),
      };
    });
    const selIds = new Set(sel.map((n) => n.id));
    const edgeClones = get()
      .edges.filter((e) => selIds.has(e.source) && selIds.has(e.target))
      .map((e) => ({
        ...e,
        id: makeId("e"),
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        selected: false,
      }));
    set((s) => ({
      nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), ...clones],
      edges: [...s.edges, ...edgeClones],
    }));
  },

  copySelection: () => {
    const nodes = get().nodes.filter((n) => n.selected);
    const ids = new Set(nodes.map((n) => n.id));
    const edges = get().edges.filter(
      (e) => ids.has(e.source) && ids.has(e.target),
    );
    if (!nodes.length) return;
    set({ clipboard: { nodes: structuredClone(nodes), edges: structuredClone(edges) } });
  },

  paste: () => {
    const clip = get().clipboard;
    if (!clip || !clip.nodes.length) return;
    get().commit();
    const idMap = new Map<string, string>();
    const nodes = clip.nodes.map((n) => {
      const id = makeId();
      idMap.set(n.id, id);
      return {
        ...n,
        id,
        position: { x: n.position.x + 32, y: n.position.y + 32 },
        selected: true,
      };
    });
    const edges = clip.edges.map((e) => ({
      ...e,
      id: makeId("e"),
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
    }));
    set((s) => ({
      nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), ...nodes],
      edges: [...s.edges, ...edges],
    }));
  },

  selectAll: () =>
    set((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, selected: true })),
      edges: s.edges.map((e) => ({ ...e, selected: true })),
    })),

  clearSelection: () =>
    set((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, selected: false })),
      edges: s.edges.map((e) => ({ ...e, selected: false })),
    })),

  setSelected: (nodeIds, edgeIds = []) => {
    const ns = new Set(nodeIds);
    const es = new Set(edgeIds);
    set((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, selected: ns.has(n.id) })),
      edges: s.edges.map((e) => ({ ...e, selected: es.has(e.id) })),
    }));
  },

  toggleLockSelected: () => {
    get().commit();
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.selected
          ? {
              ...n,
              draggable: n.data.locked ? true : false,
              data: { ...n.data, locked: !n.data.locked },
            }
          : n,
      ),
    }));
  },

  bringToFront: () => {
    get().commit();
    set((s) => {
      const sel = s.nodes.filter((n) => n.selected);
      const rest = s.nodes.filter((n) => !n.selected);
      return { nodes: [...rest, ...sel] };
    });
  },

  sendToBack: () => {
    get().commit();
    set((s) => {
      const sel = s.nodes.filter((n) => n.selected);
      const rest = s.nodes.filter((n) => !n.selected);
      return { nodes: [...sel, ...rest] };
    });
  },

  alignSelected: (axis) => {
    const sel = get().nodes.filter((n) => n.selected);
    if (sel.length < 2) return;
    get().commit();
    const dims = sel.map((n) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      w: n.width ?? 100,
      h: n.height ?? 60,
    }));
    const minX = Math.min(...dims.map((d) => d.x));
    const maxX = Math.max(...dims.map((d) => d.x + d.w));
    const minY = Math.min(...dims.map((d) => d.y));
    const maxY = Math.max(...dims.map((d) => d.y + d.h));
    const map = new Map(dims.map((d) => [d.id, d]));
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (!n.selected) return n;
        const d = map.get(n.id)!;
        const p = { ...n.position };
        if (axis === "left") p.x = minX;
        if (axis === "right") p.x = maxX - d.w;
        if (axis === "centerX") p.x = (minX + maxX) / 2 - d.w / 2;
        if (axis === "top") p.y = minY;
        if (axis === "bottom") p.y = maxY - d.h;
        if (axis === "centerY") p.y = (minY + maxY) / 2 - d.h / 2;
        return { ...n, position: p };
      }),
    }));
  },

  distributeSelected: (axis) => {
    const sel = get().nodes.filter((n) => n.selected);
    if (sel.length < 3) return;
    get().commit();
    const key = axis === "x" ? "x" : "y";
    const sizeKey = axis === "x" ? "width" : "height";
    const sorted = [...sel].sort((a, b) => a.position[key] - b.position[key]);
    const first = sorted[0].position[key];
    const last =
      sorted[sorted.length - 1].position[key] +
      ((sorted[sorted.length - 1][sizeKey] as number) ?? 0);
    const totalSize = sorted.reduce(
      (sum, n) => sum + ((n[sizeKey] as number) ?? 0),
      0,
    );
    const gap = (last - first - totalSize) / (sorted.length - 1);
    let cursor = first;
    const positions = new Map<string, number>();
    for (const n of sorted) {
      positions.set(n.id, cursor);
      cursor += ((n[sizeKey] as number) ?? 0) + gap;
    }
    set((s) => ({
      nodes: s.nodes.map((n) =>
        positions.has(n.id)
          ? { ...n, position: { ...n.position, [key]: positions.get(n.id)! } }
          : n,
      ),
    }));
  },

  undo: () =>
    set((s) => {
      if (!s.past.length) return s;
      const previous = s.past[s.past.length - 1];
      return {
        nodes: previous.nodes,
        edges: previous.edges,
        past: s.past.slice(0, -1),
        future: [snapshot(s), ...s.future].slice(0, HISTORY_LIMIT),
        dirty: true,
      };
    }),

  redo: () =>
    set((s) => {
      if (!s.future.length) return s;
      const next = s.future[0];
      return {
        nodes: next.nodes,
        edges: next.edges,
        past: [...s.past, snapshot(s)].slice(-HISTORY_LIMIT),
        future: s.future.slice(1),
        dirty: true,
      };
    }),

  setName: (name) => set({ name, dirty: true }),
  setPref: (patch) => set(patch),

  loadProject: (p) =>
    set({
      projectId: p.id,
      name: p.name,
      kind: p.kind,
      nodes: p.nodes,
      edges: p.edges,
      past: [],
      future: [],
      dirty: false,
    }),

  newProject: (kind = "general", name = "Untitled Diagram") =>
    set({
      projectId: makeId("p"),
      name,
      kind,
      nodes: [],
      edges: [],
      past: [],
      future: [],
      dirty: false,
    }),

  setGraph: (nodes, edges) => {
    get().commit();
    set({ nodes, edges });
  },

  toProject: () => {
    const s = get();
    return {
      id: s.projectId,
      name: s.name,
      kind: s.kind,
      nodes: s.nodes,
      edges: s.edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },

  markSaved: () => set({ dirty: false }),
}));
