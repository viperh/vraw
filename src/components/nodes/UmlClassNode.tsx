"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import type { DiagramNode, UmlMember, UmlVisibility } from "@/types/diagram";
import { useEditorStore } from "@/stores/editor-store";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { measureTextWidth, useAutoWidth } from "@/hooks/use-auto-size";
import { ConnectHandles } from "./handles";
import { ConnectArrows } from "./ConnectArrows";

const VIS_SYMBOL: Record<UmlVisibility, string> = {
  public: "+",
  private: "−",
  protected: "#",
  package: "~",
};

function MemberRow({ m, color }: { m: UmlMember; color: string }) {
  return (
    <div className="truncate px-2 py-[2px] text-left" style={{ color }}>
      <span className="opacity-70">{VIS_SYMBOL[m.visibility]}</span> {m.name}
    </div>
  );
}

function UmlClassNodeImpl({ id, data, selected, width, height }: NodeProps<DiagramNode>) {
  const s = data.style;
  const updateNodeData = useEditorStore((st) => st.updateNodeData);
  const { editing, draft, setDraft, start, commit, onKeyDown, ref } =
    useInlineEdit(data.label, (label) => updateNodeData(id, { label }));
  const attrs = data.attributes ?? [];
  const methods = data.methods ?? [];
  const isEnum = data.shape === "uml-enum";

  // Widen so the title and longest member row stay legible.
  let contentW = measureTextWidth(data.label, {
    fontSize: s.fontSize,
    fontWeight: 600,
    italic: s.italic,
  }) + 20;
  for (const m of [...attrs, ...methods]) {
    const rowW = measureTextWidth(`${VIS_SYMBOL[m.visibility]} ${m.name}`, {
      fontSize: 12,
      fontWeight: 400,
    });
    contentW = Math.max(contentW, rowW + 18);
  }
  useAutoWidth(id, width, contentW, 120, 520);

  return (
    <div
      className="vraw-shape-body relative flex flex-col overflow-hidden"
      style={{
        width: width ?? 200,
        minHeight: height ?? 140,
        background: s.fill,
        border: `${s.strokeWidth}px ${s.strokeStyle} ${s.stroke}`,
        borderRadius: 4,
        opacity: s.opacity,
        boxShadow: s.shadow ? "0 6px 14px rgba(0,0,0,0.18)" : undefined,
      }}
      onDoubleClick={start}
    >
      <NodeResizer isVisible={selected && !data.locked} minWidth={120} minHeight={80} />

      {/* Title compartment */}
      <div
        className="border-b px-2 py-1 text-center"
        style={{ borderColor: s.stroke, color: s.fontColor }}
      >
        {data.stereotype && (
          <div className="text-[10px] italic opacity-70">«{data.stereotype}»</div>
        )}
        {editing ? (
          <input
            ref={ref}
            className="vraw-node-input nodrag text-center font-semibold"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            style={{
              fontSize: s.fontSize,
              fontWeight: 700,
              fontStyle: s.italic ? "italic" : "normal",
              textDecoration: s.underline ? "underline" : "none",
            }}
          />
        ) : (
          <div
            className="font-semibold"
            style={{
              fontSize: s.fontSize,
              fontStyle: s.italic ? "italic" : "normal",
              textDecoration: s.underline ? "underline" : "none",
            }}
          >
            {data.label}
          </div>
        )}
      </div>

      {/* Attributes / values compartment */}
      <div
        className="border-b py-[2px] text-[12px]"
        style={{ borderColor: s.stroke }}
      >
        {attrs.length ? (
          attrs.map((m) => <MemberRow key={m.id} m={m} color={s.fontColor} />)
        ) : (
          <div className="px-2 py-[2px] text-[11px] italic opacity-40">
            no {isEnum ? "values" : "attributes"}
          </div>
        )}
      </div>

      {/* Methods compartment (hidden for enums) */}
      {!isEnum && (
        <div className="py-[2px] text-[12px]">
          {methods.length ? (
            methods.map((m) => <MemberRow key={m.id} m={m} color={s.fontColor} />)
          ) : (
            <div className="px-2 py-[2px] text-[11px] italic opacity-40">
              no methods
            </div>
          )}
        </div>
      )}

      <ConnectHandles />
      <ConnectArrows id={id} selected={!!selected} />
    </div>
  );
}

export const UmlClassNode = memo(UmlClassNodeImpl);
