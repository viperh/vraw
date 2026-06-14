"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft } from "lucide-react";
import { useUiStore, type ConnectState } from "@/stores/ui-store";

const SIDES: {
  handle: ConnectState["handle"];
  position: Position;
  Icon: typeof ArrowUp;
}[] = [
  { handle: "t", position: Position.Top, Icon: ArrowUp },
  { handle: "r", position: Position.Right, Icon: ArrowRight },
  { handle: "b", position: Position.Bottom, Icon: ArrowDown },
  { handle: "l", position: Position.Left, Icon: ArrowLeft },
];

/**
 * ErdPlus-style connect affordance: when a node is selected, four arrows appear
 * around it. Clicking one starts a connect gesture; the user then clicks any
 * other node to complete the edge (handled in the Canvas).
 */
export function ConnectArrows({ id, selected }: { id: string; selected: boolean }) {
  const startConnect = useUiStore((s) => s.startConnect);
  const connecting = useUiStore((s) => s.connect !== null);
  const visible = selected && !connecting;

  return (
    <>
      {SIDES.map(({ handle, position, Icon }) => (
        <NodeToolbar
          key={handle}
          nodeId={id}
          isVisible={visible}
          position={position}
          offset={10}
        >
          <button
            type="button"
            title="Drag a connection from here — then click a target shape"
            onClick={(e) => {
              e.stopPropagation();
              startConnect(id, handle);
            }}
            className="grid h-5 w-5 place-items-center rounded-full border border-accent bg-surface text-accent shadow-sm transition-transform hover:scale-110 hover:bg-accent hover:text-accent-fg"
          >
            <Icon size={12} />
          </button>
        </NodeToolbar>
      ))}
    </>
  );
}
