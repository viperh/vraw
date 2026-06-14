"use client";

import { cn } from "@/lib/utils";

export function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="border-b border-border px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {title}
        </h3>
        {right}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

export function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="shrink-0 text-muted">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5">{children}</div>
    </label>
  );
}

export function ColorField({
  value,
  onChange,
  allowNone,
}: {
  value: string;
  onChange: (v: string) => void;
  allowNone?: boolean;
}) {
  const isNone = value === "transparent" || value === "none";
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-6 w-6 overflow-hidden rounded border border-border">
        {isNone ? (
          <div className="grid h-full w-full place-items-center bg-surface text-[9px] text-muted">
            ∅
          </div>
        ) : (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -left-1 -top-1 h-8 w-8 cursor-pointer border-0 bg-transparent p-0"
          />
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded border border-border bg-background px-1.5 py-1 font-mono text-[11px] outline-none focus:border-accent"
      />
      {allowNone && (
        <button
          type="button"
          onClick={() => onChange(isNone ? "#ffffff" : "transparent")}
          className={cn(
            "rounded border border-border px-1.5 py-1 text-[10px]",
            isNone ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2",
          )}
          title="No color"
        >
          ∅
        </button>
      )}
    </div>
  );
}

export function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 rounded border border-border bg-background px-1.5 py-1 text-[11px] outline-none focus:border-accent"
      />
      {suffix && <span className="text-[10px] text-muted">{suffix}</span>}
    </div>
  );
}

export function SelectField<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full max-w-[120px] rounded border border-border bg-background px-1.5 py-1 text-[11px] outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  // Explicit pixel geometry (no Tailwind translate utilities) so the knob
  // position is unambiguous and identical across every switch in the app.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 36,
        height: 20,
        flexShrink: 0,
        borderRadius: 9999,
        cursor: "pointer",
        backgroundColor: checked ? "var(--accent)" : "var(--border-strong)",
        transition: "background-color 0.15s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: 2,
          width: 16,
          height: 16,
          borderRadius: 9999,
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          transform: checked ? "translateX(16px)" : "translateX(0)",
          transition: "transform 0.15s ease",
        }}
      />
    </button>
  );
}

export function SegmentedButtons<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; icon: React.ReactNode; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.label}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex h-7 w-8 items-center justify-center border-r border-border last:border-r-0 transition-colors",
            value === o.value
              ? "bg-accent-soft text-accent"
              : "text-muted hover:bg-surface-2",
          )}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
