"use client";

import { useState } from "react";
import { X, FileImage, FileCode, FileText, Braces, Loader2 } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import { exportDiagram, downloadText, type ExportFormat } from "@/lib/export";
import { toProjectFile } from "@/lib/persistence";
import { cn } from "@/lib/utils";

const FORMATS: { id: ExportFormat | "json"; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: "png", label: "PNG", icon: <FileImage size={18} />, hint: "Raster image" },
  { id: "svg", label: "SVG", icon: <FileCode size={18} />, hint: "Vector, scalable" },
  { id: "pdf", label: "PDF", icon: <FileText size={18} />, hint: "Document" },
  { id: "json", label: "JSON", icon: <Braces size={18} />, hint: "Editable project" },
];

export function ExportDialog() {
  const open = useUiStore((s) => s.exportOpen);
  const setOpen = useUiStore((s) => s.setExport);
  const [format, setFormat] = useState<ExportFormat | "json">("png");
  const [bg, setBg] = useState<"theme" | "white" | "transparent">("theme");
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleExport = async () => {
    setError(null);
    const state = useEditorStore.getState();
    const fileName = state.name.replace(/[^a-z0-9-_ ]/gi, "").trim() || "diagram";

    if (format === "json") {
      downloadText(JSON.stringify(toProjectFile(state.toProject()), null, 2), `${fileName}.vraw.json`);
      setOpen(false);
      return;
    }

    // Resolve the background. "Match theme" uses the live canvas colour, so a
    // dark-mode diagram (with light text) exports onto a dark backdrop and
    // stays legible instead of disappearing on white.
    const themeBg =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--canvas")
        .trim() || "#ffffff";
    // PDF can't be transparent — fall back to the theme background.
    const effBg = format === "pdf" && bg === "transparent" ? "theme" : bg;
    const transparent = effBg === "transparent";
    const background =
      effBg === "white" ? "#ffffff" : effBg === "transparent" ? undefined : themeBg;

    setBusy(true);
    try {
      await exportDiagram(format, state.nodes, fileName, {
        transparent,
        scale,
        background,
      });
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  const isImage = format === "png" || format === "svg" || format === "pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !busy && setOpen(false)}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Export diagram</h2>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-4 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors",
                  format === f.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-muted hover:bg-surface-2",
                )}
              >
                {f.icon}
                <span className="font-medium">{f.label}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted">
            {FORMATS.find((f) => f.id === format)?.hint}
          </p>

          {isImage && (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <label className="flex items-center justify-between text-xs">
                <span>Background</span>
                <select
                  value={format === "pdf" && bg === "transparent" ? "theme" : bg}
                  onChange={(e) =>
                    setBg(e.target.value as "theme" | "white" | "transparent")
                  }
                  className="rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
                >
                  <option value="theme">Match theme</option>
                  <option value="white">White</option>
                  {(format === "png" || format === "svg") && (
                    <option value="transparent">Transparent</option>
                  )}
                </select>
              </label>
              {(format === "png" || format === "pdf") && (
                <label className="flex items-center justify-between text-xs">
                  <span>Resolution scale</span>
                  <select
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
                  >
                    <option value={1}>1× (standard)</option>
                    <option value={2}>2× (retina)</option>
                    <option value={3}>3× (high)</option>
                    <option value={4}>4× (print)</option>
                  </select>
                </label>
              )}
            </div>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
