"use client";

import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignStartVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  BringToFront,
  SendToBack,
  Lock,
  Unlock,
  Plus,
  Trash2,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import type {
  EdgeData,
  ErColumn,
  NodeStyle,
  UmlMember,
  UmlVisibility,
} from "@/types/diagram";
import { makeId } from "@/lib/shape-catalog";
import {
  ColorField,
  NumberField,
  Row,
  Section,
  SegmentedButtons,
  SelectField,
  Toggle,
} from "@/components/ui/fields";
import { IconButton } from "@/components/ui/IconButton";

function ArrangePanel() {
  const s = useEditorStore;
  const align = s((st) => st.alignSelected);
  const distribute = s((st) => st.distributeSelected);
  const bringToFront = s((st) => st.bringToFront);
  const sendToBack = s((st) => st.sendToBack);
  const toggleLock = s((st) => st.toggleLockSelected);
  const count = s((st) => st.nodes.filter((n) => n.selected).length);
  const anyLocked = s((st) =>
    st.nodes.some((n) => n.selected && n.data.locked),
  );

  const btn =
    "flex h-8 items-center justify-center rounded-md border border-border text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-30";

  return (
    <Section title="Arrange">
      <div className="grid grid-cols-6 gap-1">
        <button className={btn} title="Align left" disabled={count < 2} onClick={() => align("left")}><AlignStartVertical size={14} /></button>
        <button className={btn} title="Align center" disabled={count < 2} onClick={() => align("centerX")}><AlignHorizontalJustifyCenter size={14} /></button>
        <button className={btn} title="Align right" disabled={count < 2} onClick={() => align("right")}><AlignEndVertical size={14} /></button>
        <button className={btn} title="Align top" disabled={count < 2} onClick={() => align("top")}><AlignStartHorizontal size={14} /></button>
        <button className={btn} title="Align middle" disabled={count < 2} onClick={() => align("centerY")}><AlignVerticalJustifyCenter size={14} /></button>
        <button className={btn} title="Align bottom" disabled={count < 2} onClick={() => align("bottom")}><AlignEndHorizontal size={14} /></button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        <button className={btn} title="Distribute horizontally" disabled={count < 3} onClick={() => distribute("x")}><AlignHorizontalSpaceBetween size={14} /></button>
        <button className={btn} title="Distribute vertically" disabled={count < 3} onClick={() => distribute("y")}><AlignVerticalSpaceBetween size={14} /></button>
        <button className={btn} title="Bring to front" onClick={bringToFront}><BringToFront size={14} /></button>
        <button className={btn} title="Send to back" onClick={sendToBack}><SendToBack size={14} /></button>
      </div>
      <button
        className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-border text-xs text-muted hover:bg-surface-2 hover:text-foreground"
        onClick={toggleLock}
      >
        {anyLocked ? <Unlock size={13} /> : <Lock size={13} />}
        {anyLocked ? "Unlock" : "Lock"}
      </button>
    </Section>
  );
}

function FormatToggle({
  active,
  title,
  onClick,
  children,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={
        "flex h-7 w-8 items-center justify-center border-r border-border last:border-r-0 transition-colors " +
        (active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2")
      }
    >
      {children}
    </button>
  );
}

function StylePanel({ ids, style }: { ids: string[]; style: NodeStyle }) {
  const update = useEditorStore((st) => st.updateNodeStyle);
  const set = (patch: Partial<NodeStyle>) => update(ids, patch);

  return (
    <>
      <Section title="Style">
        <Row label="Fill">
          <ColorField value={style.fill} allowNone onChange={(v) => set({ fill: v })} />
        </Row>
        <Row label="Border">
          <ColorField value={style.stroke} allowNone onChange={(v) => set({ stroke: v })} />
        </Row>
        <Row label="Border width">
          <NumberField value={style.strokeWidth} min={0} max={20} onChange={(v) => set({ strokeWidth: v })} suffix="px" />
        </Row>
        <Row label="Border style">
          <SelectField
            value={style.strokeStyle}
            onChange={(v) => set({ strokeStyle: v })}
            options={[
              { value: "solid", label: "Solid" },
              { value: "dashed", label: "Dashed" },
              { value: "dotted", label: "Dotted" },
            ]}
          />
        </Row>
        <Row label="Corner radius">
          <NumberField value={style.borderRadius} min={0} max={60} onChange={(v) => set({ borderRadius: v })} suffix="px" />
        </Row>
        <Row label="Opacity">
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={style.opacity}
            onChange={(e) => set({ opacity: Number(e.target.value) })}
            className="w-24 accent-[var(--accent)]"
          />
          <span className="w-8 text-right text-[11px] text-muted">
            {Math.round(style.opacity * 100)}%
          </span>
        </Row>
        <Row label="Shadow">
          <Toggle checked={style.shadow} onChange={(v) => set({ shadow: v })} />
        </Row>
      </Section>

      <Section title="Text">
        <Row label="Format">
          <div className="flex overflow-hidden rounded-md border border-border">
            <FormatToggle
              active={style.fontWeight >= 600}
              title="Bold"
              onClick={() => set({ fontWeight: style.fontWeight >= 600 ? 400 : 700 })}
            >
              <Bold size={14} />
            </FormatToggle>
            <FormatToggle
              active={style.italic}
              title="Italic"
              onClick={() => set({ italic: !style.italic })}
            >
              <Italic size={14} />
            </FormatToggle>
            <FormatToggle
              active={style.underline}
              title="Underline"
              onClick={() => set({ underline: !style.underline })}
            >
              <Underline size={14} />
            </FormatToggle>
          </div>
        </Row>
        <Row label="Font size">
          <NumberField value={style.fontSize} min={6} max={72} onChange={(v) => set({ fontSize: v })} suffix="px" />
        </Row>
        <Row label="Weight">
          <SelectField
            value={String(style.fontWeight)}
            onChange={(v) => set({ fontWeight: Number(v) })}
            options={[
              { value: "400", label: "Regular" },
              { value: "500", label: "Medium" },
              { value: "600", label: "Semibold" },
              { value: "700", label: "Bold" },
            ]}
          />
        </Row>
        <Row label="Color">
          <ColorField value={style.fontColor} onChange={(v) => set({ fontColor: v })} />
        </Row>
        <Row label="Align">
          <SegmentedButtons
            value={style.textAlign}
            onChange={(v) => set({ textAlign: v })}
            options={[
              { value: "left", label: "Left", icon: <AlignLeft size={14} /> },
              { value: "center", label: "Center", icon: <AlignCenter size={14} /> },
              { value: "right", label: "Right", icon: <AlignRight size={14} /> },
            ]}
          />
        </Row>
      </Section>
    </>
  );
}

const VIS_OPTS: { value: UmlVisibility; label: string }[] = [
  { value: "public", label: "+" },
  { value: "private", label: "−" },
  { value: "protected", label: "#" },
  { value: "package", label: "~" },
];

function MemberEditor({
  nodeId,
  field,
  members,
}: {
  nodeId: string;
  field: "attributes" | "methods";
  members: UmlMember[];
}) {
  const update = useEditorStore((st) => st.updateNodeData);
  const change = (next: UmlMember[]) => update(nodeId, { [field]: next });

  return (
    <Section
      title={field}
      right={
        <IconButton
          label={`Add ${field}`}
          className="h-6 w-6"
          onClick={() =>
            change([...members, { id: makeId("u"), name: "new", visibility: "public" }])
          }
        >
          <Plus size={14} />
        </IconButton>
      }
    >
      {members.map((m, i) => (
        <div key={m.id} className="flex items-center gap-1">
          <select
            value={m.visibility}
            onChange={(e) => {
              const next = [...members];
              next[i] = { ...m, visibility: e.target.value as UmlVisibility };
              change(next);
            }}
            className="rounded border border-border bg-background px-1 py-1 text-[11px] outline-none focus:border-accent"
          >
            {VIS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            value={m.name}
            onChange={(e) => {
              const next = [...members];
              next[i] = { ...m, name: e.target.value };
              change(next);
            }}
            className="min-w-0 flex-1 rounded border border-border bg-background px-1.5 py-1 text-[11px] outline-none focus:border-accent"
          />
          <IconButton
            label="Remove"
            className="h-6 w-6 hover:text-danger"
            onClick={() => change(members.filter((x) => x.id !== m.id))}
          >
            <Trash2 size={13} />
          </IconButton>
        </div>
      ))}
      {!members.length && (
        <p className="text-[11px] italic text-muted">none</p>
      )}
    </Section>
  );
}

function ColumnEditor({ nodeId, columns }: { nodeId: string; columns: ErColumn[] }) {
  const update = useEditorStore((st) => st.updateNodeData);
  const change = (next: ErColumn[]) => update(nodeId, { columns: next });

  return (
    <Section
      title="Columns"
      right={
        <IconButton
          label="Add column"
          className="h-6 w-6"
          onClick={() =>
            change([
              ...columns,
              { id: makeId("c"), name: "column", type: "VARCHAR", key: null },
            ])
          }
        >
          <Plus size={14} />
        </IconButton>
      }
    >
      {columns.map((c, i) => (
        <div key={c.id} className="flex items-center gap-1">
          <select
            value={c.key ?? ""}
            onChange={(e) => {
              const next = [...columns];
              next[i] = {
                ...c,
                key: (e.target.value || null) as ErColumn["key"],
              };
              change(next);
            }}
            className="w-12 rounded border border-border bg-background px-1 py-1 text-[10px] outline-none focus:border-accent"
          >
            <option value="">—</option>
            <option value="PK">PK</option>
            <option value="FK">FK</option>
          </select>
          <input
            value={c.name}
            onChange={(e) => {
              const next = [...columns];
              next[i] = { ...c, name: e.target.value };
              change(next);
            }}
            className="min-w-0 flex-1 rounded border border-border bg-background px-1.5 py-1 text-[11px] outline-none focus:border-accent"
          />
          <input
            value={c.type}
            onChange={(e) => {
              const next = [...columns];
              next[i] = { ...c, type: e.target.value };
              change(next);
            }}
            className="w-16 rounded border border-border bg-background px-1.5 py-1 text-[10px] uppercase outline-none focus:border-accent"
          />
          <IconButton
            label="Remove"
            className="h-6 w-6 hover:text-danger"
            onClick={() => change(columns.filter((x) => x.id !== c.id))}
          >
            <Trash2 size={13} />
          </IconButton>
        </div>
      ))}
    </Section>
  );
}

function EdgePanel({ ids, data }: { ids: string[]; data: EdgeData }) {
  const update = useEditorStore((st) => st.updateEdgeData);
  const set = (patch: Partial<EdgeData>) => update(ids, patch);
  const arrowOpts = [
    { value: "none", label: "None" },
    { value: "arrow", label: "Arrow" },
    { value: "triangle", label: "Triangle (filled)" },
    { value: "triangle-open", label: "Triangle (open)" },
    { value: "diamond", label: "Diamond (filled)" },
    { value: "diamond-open", label: "Diamond (open)" },
    { value: "circle", label: "Circle" },
  ] as const;

  // Two distinct ER cardinality notations, both written as the edge label.
  // Chen: look-across multiplicities (1, N, M). Min–max: participation (min,max).
  const chen = ["1", "N", "M"];
  const minMax = ["(0,1)", "(1,1)", "(0,N)", "(1,N)", "(1,M)", "(0,M)"];

  return (
    <Section title="Connection">
      <Row label="Label">
        <input
          value={data.label ?? ""}
          onChange={(e) => set({ label: e.target.value })}
          className="w-32 rounded border border-border bg-background px-1.5 py-1 text-[11px] outline-none focus:border-accent"
        />
      </Row>
      <Row label="Color">
        <ColorField value={data.stroke} onChange={(v) => set({ stroke: v })} />
      </Row>
      <Row label="Width">
        <NumberField value={data.strokeWidth} min={1} max={12} onChange={(v) => set({ strokeWidth: v })} suffix="px" />
      </Row>
      <Row label="Line style">
        <SelectField
          value={data.strokeStyle}
          onChange={(v) => set({ strokeStyle: v })}
          options={[
            { value: "solid", label: "Solid" },
            { value: "dashed", label: "Dashed" },
            { value: "dotted", label: "Dotted" },
          ]}
        />
      </Row>
      <Row label="Routing">
        <SelectField
          value={data.routing}
          onChange={(v) => set({ routing: v })}
          options={[
            { value: "smoothstep", label: "Orthogonal" },
            { value: "step", label: "Sharp step" },
            { value: "default", label: "Curved" },
            { value: "straight", label: "Straight" },
          ]}
        />
      </Row>
      <Row label="Start cap">
        <SelectField value={data.startArrow} onChange={(v) => set({ startArrow: v })} options={[...arrowOpts]} />
      </Row>
      <Row label="End cap">
        <SelectField value={data.endArrow} onChange={(v) => set({ endArrow: v })} options={[...arrowOpts]} />
      </Row>
      <Row label="Animated">
        <Toggle checked={!!data.animated} onChange={(v) => set({ animated: v })} />
      </Row>

      <div className="mt-1 border-t border-border pt-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
          ER cardinality
        </p>
        <p className="mb-1 text-[10px] text-muted">Chen (1 : N)</p>
        <div className="flex flex-wrap gap-1">
          {chen.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ label: c })}
              className="min-w-7 rounded border border-border px-2 py-1 text-[11px] text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {c}
            </button>
          ))}
        </div>
        <p className="mb-1 mt-2 text-[10px] text-muted">Min–Max (min, max)</p>
        <div className="flex flex-wrap gap-1">
          {minMax.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ label: c })}
              className="rounded border border-border px-2 py-1 text-[11px] text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CanvasPanel() {
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const showGrid = useEditorStore((s) => s.showGrid);
  const showMinimap = useEditorStore((s) => s.showMinimap);
  const defaultRouting = useEditorStore((s) => s.defaultRouting);
  const setPref = useEditorStore((s) => s.setPref);

  return (
    <Section title="Canvas">
      <Row label="Show grid">
        <Toggle checked={showGrid} onChange={(v) => setPref({ showGrid: v })} />
      </Row>
      <Row label="Snap to grid">
        <Toggle checked={snapToGrid} onChange={(v) => setPref({ snapToGrid: v })} />
      </Row>
      <Row label="Minimap">
        <Toggle checked={showMinimap} onChange={(v) => setPref({ showMinimap: v })} />
      </Row>
      <Row label="Default routing">
        <SelectField
          value={defaultRouting}
          onChange={(v) => setPref({ defaultRouting: v })}
          options={[
            { value: "smoothstep", label: "Orthogonal" },
            { value: "step", label: "Sharp step" },
            { value: "default", label: "Curved" },
            { value: "straight", label: "Straight" },
          ]}
        />
      </Row>
    </Section>
  );
}

function PositionPanel({ id }: { id: string }) {
  const node = useEditorStore((s) => s.nodes.find((n) => n.id === id));
  if (!node) return null;
  return (
    <Section title="Position & Size">
      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted">
        <div>X <span className="text-foreground">{Math.round(node.position.x)}</span></div>
        <div>Y <span className="text-foreground">{Math.round(node.position.y)}</span></div>
        <div>W <span className="text-foreground">{Math.round(node.width ?? 0)}</span></div>
        <div>H <span className="text-foreground">{Math.round(node.height ?? 0)}</span></div>
      </div>
    </Section>
  );
}

export function RightSidebar() {
  const open = useUiStore((s) => s.rightOpen);
  const selNodes = useEditorStore(
    useShallow((s) => s.nodes.filter((n) => n.selected)),
  );
  const selEdges = useEditorStore(
    useShallow((s) => s.edges.filter((e) => e.selected)),
  );

  if (!open) return null;

  const nodeIds = selNodes.map((n) => n.id);
  const single = selNodes.length === 1 ? selNodes[0] : null;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-l border-border bg-surface">
      {selNodes.length === 0 && selEdges.length === 0 && <CanvasPanel />}

      {selNodes.length > 0 && (
        <>
          <ArrangePanel />
          <StylePanel ids={nodeIds} style={selNodes[0].data.style} />
        </>
      )}

      {single && (single.data.shape === "uml-class" || single.data.shape === "uml-interface") && (
        <>
          <MemberEditor nodeId={single.id} field="attributes" members={single.data.attributes ?? []} />
          <MemberEditor nodeId={single.id} field="methods" members={single.data.methods ?? []} />
        </>
      )}
      {single && single.data.shape === "uml-enum" && (
        <MemberEditor nodeId={single.id} field="attributes" members={single.data.attributes ?? []} />
      )}
      {single && single.data.shape === "er-entity" && (
        <ColumnEditor nodeId={single.id} columns={single.data.columns ?? []} />
      )}
      {single && <PositionPanel id={single.id} />}

      {selEdges.length > 0 && (
        <EdgePanel ids={selEdges.map((e) => e.id)} data={selEdges[0].data ?? ({} as EdgeData)} />
      )}
    </aside>
  );
}
