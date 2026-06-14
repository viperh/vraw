"use client";

import { useRef } from "react";
import { useReactFlow, useStore } from "@xyflow/react";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sun,
  Moon,
  Download,
  Upload,
  Save,
  FolderOpen,
  FilePlus2,
  PanelLeft,
  PanelRight,
  Command,
  Workflow,
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import { useTheme } from "@/hooks/use-theme";
import { IconButton } from "@/components/ui/IconButton";
import { saveProject, parseProjectFile } from "@/lib/persistence";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<string, string> = {
  flowchart: "Flowchart",
  "uml-class": "UML Class",
  "uml-sequence": "UML Sequence",
  "uml-usecase": "UML Use Case",
  "uml-activity": "UML Activity",
  "uml-state": "UML State",
  er: "ER Diagram",
  network: "Network",
  orgchart: "Org Chart",
  mindmap: "Mind Map",
  bpmn: "BPMN",
  general: "Diagram",
};

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}

export function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore((s) => s.transform[2]);

  const name = useEditorStore((s) => s.name);
  const kind = useEditorStore((s) => s.kind);
  const dirty = useEditorStore((s) => s.dirty);
  const setName = useEditorStore((s) => s.setName);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  const toggleLeft = useUiStore((s) => s.toggleLeft);
  const toggleRight = useUiStore((s) => s.toggleRight);
  const setExport = useUiStore((s) => s.setExport);
  const setProjects = useUiStore((s) => s.setProjects);
  const setPalette = useUiStore((s) => s.setPalette);

  const { theme, toggle } = useTheme();
  const fileInput = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const project = useEditorStore.getState().toProject();
    saveProject(project);
    useEditorStore.getState().markSaved();
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const project = parseProjectFile(text);
    if (project) {
      useEditorStore.getState().loadProject(project);
      fitView({ padding: 0.3 });
    } else {
      alert("Could not read that file — expected a vraw JSON export.");
    }
  };

  const newDiagram = () => {
    if (dirty) handleSave();
    useEditorStore.getState().newProject();
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-surface px-2">
      <div className="flex items-center gap-2 pl-1 pr-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-fg">
          <Workflow size={16} />
        </div>
        <span className="hidden text-sm font-semibold sm:block">vraw</span>
      </div>

      <Divider />

      <div className="flex min-w-0 items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-40 truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium outline-none hover:border-border focus:border-accent focus:bg-background md:w-56"
          aria-label="Project name"
        />
        <span className="hidden rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted lg:block">
          {KIND_LABEL[kind] ?? "Diagram"}
        </span>
        <span
          className={cn(
            "text-[10px]",
            dirty ? "text-muted" : "text-emerald-500",
          )}
        >
          {dirty ? "Unsaved" : "Saved"}
        </span>
      </div>

      <div className="ml-auto flex items-center">
        <IconButton label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
          <Undo2 size={16} />
        </IconButton>
        <IconButton label="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo}>
          <Redo2 size={16} />
        </IconButton>

        <Divider />

        <IconButton label="Zoom out" onClick={() => zoomOut()}>
          <ZoomOut size={16} />
        </IconButton>
        <button
          type="button"
          onClick={() => fitView({ padding: 0.3 })}
          className="min-w-[3rem] rounded px-1 text-center text-xs tabular-nums text-muted hover:text-foreground"
          title="Fit to screen"
        >
          {Math.round((zoom ?? 1) * 100)}%
        </button>
        <IconButton label="Zoom in" onClick={() => zoomIn()}>
          <ZoomIn size={16} />
        </IconButton>
        <IconButton label="Fit to screen" onClick={() => fitView({ padding: 0.3 })}>
          <Maximize size={16} />
        </IconButton>

        <Divider />

        <IconButton label="Command palette (Ctrl+K)" onClick={() => setPalette(true)}>
          <Command size={16} />
        </IconButton>
        <IconButton label="Open project" onClick={() => setProjects(true)}>
          <FolderOpen size={16} />
        </IconButton>
        <IconButton label="New diagram" onClick={newDiagram}>
          <FilePlus2 size={16} />
        </IconButton>
        <IconButton label="Import JSON" onClick={() => fileInput.current?.click()}>
          <Upload size={16} />
        </IconButton>
        <IconButton label="Save (Ctrl+S)" onClick={handleSave}>
          <Save size={16} />
        </IconButton>
        <IconButton label="Export" onClick={() => setExport(true)}>
          <Download size={16} />
        </IconButton>

        <Divider />

        <IconButton label="Toggle theme" onClick={toggle}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <IconButton label="Toggle left panel" onClick={toggleLeft}>
          <PanelLeft size={16} />
        </IconButton>
        <IconButton label="Toggle right panel" onClick={toggleRight}>
          <PanelRight size={16} />
        </IconButton>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImportFile(f);
          e.target.value = "";
        }}
      />
    </header>
  );
}
