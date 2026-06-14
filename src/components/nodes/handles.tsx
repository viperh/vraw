import { Handle, Position } from "@xyflow/react";

/**
 * Four connection points (top/right/bottom/left). The canvas runs in
 * `connectionMode="loose"`, so each source handle also accepts connections,
 * letting users draw edges from or to any side.
 */
export function ConnectHandles() {
  return (
    <>
      <Handle id="t" type="source" position={Position.Top} />
      <Handle id="r" type="source" position={Position.Right} />
      <Handle id="b" type="source" position={Position.Bottom} />
      <Handle id="l" type="source" position={Position.Left} />
    </>
  );
}
