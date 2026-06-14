"use client";

import { useCallback, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import type { DiagramEdge, DiagramNode } from "@/types/diagram";
import { arrowMarker, edgeTypes, nodeTypes } from "@/components/nodes";
import { DEFAULT_EDGE_DATA } from "@/stores/editor-store";
import { readDragPayload } from "@/lib/dnd";

const defaultEdgeOptions: DefaultEdgeOptions = { type: "smart" };

/**
 * Custom edge markers. Filled markers use `context-stroke` so they inherit the
 * edge colour; hollow markers fill with the surface colour.
 */
function MarkerDefs() {
  return (
    <svg className="pointer-events-none absolute h-0 w-0">
      <defs>
        <marker id="vraw-diamond" markerWidth={16} markerHeight={16} refX={9} refY={5} orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M0,5 L5,1 L10,5 L5,9 Z" fill="context-stroke" stroke="context-stroke" />
        </marker>
        <marker id="vraw-diamond-open" markerWidth={16} markerHeight={16} refX={9} refY={5} orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M0,5 L5,1 L10,5 L5,9 Z" fill="var(--surface)" stroke="context-stroke" strokeWidth={1.2} />
        </marker>
        <marker id="vraw-triangle-open" markerWidth={16} markerHeight={16} refX={14} refY={8} orient="auto-start-reverse" markerUnits="userSpaceOnUse">
          <path d="M2,2 L15,8 L2,14 Z" fill="var(--surface)" stroke="context-stroke" strokeWidth={1.2} />
        </marker>
        <marker id="vraw-circle" markerWidth={12} markerHeight={12} refX={6} refY={5} orient="auto" markerUnits="userSpaceOnUse">
          <circle cx={5} cy={5} r={4} fill="context-stroke" stroke="context-stroke" />
        </marker>
      </defs>
    </svg>
  );
}

export function Canvas() {
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const onNodesChange = useEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
  const onConnect = useEditorStore((s) => s.onConnect);
  const addNode = useEditorStore((s) => s.addNode);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const showGrid = useEditorStore((s) => s.showGrid);
  const showMinimap = useEditorStore((s) => s.showMinimap);
  const setCursor = useUiStore((s) => s.setCursor);
  const connecting = useUiStore((s) => s.connect !== null);

  const { screenToFlowPosition } = useReactFlow();

  // Decorate edges with markers + animation derived from their data.
  const rfEdges = useMemo<DiagramEdge[]>(
    () =>
      edges.map((e) => {
        const d = e.data ?? DEFAULT_EDGE_DATA;
        return {
          ...e,
          animated: d.animated,
          markerStart: arrowMarker(d.startArrow, d.stroke) as never,
          markerEnd: arrowMarker(d.endArrow, d.stroke) as never,
        };
      }),
    [edges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const payload = readDragPayload(event);
      if (!payload) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(
        payload.kind,
        {
          x: position.x - payload.size[0] / 2,
          y: position.y - payload.size[1] / 2,
        },
        payload.size,
      );
    },
    [addNode, screenToFlowPosition],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const p = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setCursor(Math.round(p.x), Math.round(p.y));
    },
    [screenToFlowPosition, setCursor],
  );

  // Click-to-connect: if a connect gesture is active, clicking a node completes
  // the edge to it; clicking the pane cancels.
  const onNodeClick = useCallback(
    (_e: React.MouseEvent, node: DiagramNode) => {
      const ui = useUiStore.getState();
      const c = ui.connect;
      if (!c) return;
      if (node.id !== c.sourceId) {
        useEditorStore.getState().addEdgeFrom(c.sourceId, c.handle, node.id);
      }
      ui.cancelConnect();
    },
    [],
  );

  const onPaneClick = useCallback(() => {
    if (useUiStore.getState().connect) useUiStore.getState().cancelConnect();
  }, []);

  return (
    <div
      className="relative h-full w-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{ cursor: connecting ? "crosshair" : undefined }}
    >
      {connecting && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-accent bg-surface px-3 py-1.5 text-xs font-medium text-accent shadow-md">
          Click a target shape to connect · Esc to cancel
        </div>
      )}
      <MarkerDefs />
      <ReactFlow
        nodes={nodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={28}
        snapToGrid={snapToGrid}
        snapGrid={[16, 16]}
        deleteKeyCode={null}
        multiSelectionKeyCode={["Shift", "Meta", "Control"]}
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionKeyCode={null}
        minZoom={0.1}
        maxZoom={4}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        onPaneMouseMove={onPaneMouseMove}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--canvas)]"
      >
        {showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1.4}
            color="var(--canvas-dot)"
          />
        )}
        <Controls showInteractive={false} position="bottom-right" />
        {showMinimap && (
          <MiniMap
            pannable
            zoomable
            position="bottom-left"
            nodeColor={(n) => {
              const style = (n.data as { style?: { fill?: string; stroke?: string } })
                ?.style;
              const fill = style?.fill;
              if (fill && fill !== "transparent" && fill !== "none") return fill;
              return style?.stroke || "var(--accent)";
            }}
            maskColor="color-mix(in srgb, var(--canvas) 70%, transparent)"
          />
        )}
      </ReactFlow>
    </div>
  );
}
