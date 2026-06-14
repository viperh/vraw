"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { Command, MousePointerClick, Sparkles } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import { useTheme } from "@/hooks/use-theme";
import { useAutosave } from "@/hooks/use-autosave";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { getLastProjectId, loadProjectById, saveProject } from "@/lib/persistence";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { LeftSidebar } from "@/components/sidebar/LeftSidebar";
import { RightSidebar } from "@/components/sidebar/RightSidebar";
import { Canvas } from "@/components/canvas/Canvas";
import { StatusBar } from "@/components/editor/StatusBar";
import { CommandPalette } from "@/components/dialogs/CommandPalette";
import { ExportDialog } from "@/components/dialogs/ExportDialog";
import { ProjectsDialog } from "@/components/dialogs/ProjectsDialog";

function EmptyState() {
  const nodeCount = useEditorStore((s) => s.nodes.length);
  const setPalette = useUiStore((s) => s.setPalette);
  if (nodeCount > 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="pointer-events-auto max-w-sm rounded-2xl border border-border bg-surface/80 p-6 text-center shadow-sm backdrop-blur">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
          <Sparkles size={22} />
        </div>
        <h2 className="text-base font-semibold">Start your diagram</h2>
        <p className="mt-1 text-sm text-muted">
          Drag a shape from the left, choose a template, or open the command
          palette to add anything fast.
        </p>
        <div className="mt-4 flex flex-col gap-2 text-xs text-muted">
          <span className="flex items-center justify-center gap-2">
            <MousePointerClick size={14} /> Drag shapes onto the canvas
          </span>
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="mx-auto flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-surface-2"
          >
            <Command size={14} /> Open command palette
            <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}

function EditorInner() {
  useTheme();
  useAutosave(true);

  const setPalette = useUiStore((s) => s.setPalette);
  const leftOpen = useUiStore((s) => s.leftOpen);

  useKeyboardShortcuts({
    onCommandPalette: () => setPalette(true),
    onSave: () => {
      const ed = useEditorStore.getState();
      saveProject(ed.toProject());
      ed.markSaved();
    },
  });

  // Restore the most recently edited project on first mount.
  useEffect(() => {
    const lastId = getLastProjectId();
    if (lastId) {
      const project = loadProjectById(lastId);
      if (project) useEditorStore.getState().loadProject(project);
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        {leftOpen && <LeftSidebar />}
        <main className="relative min-w-0 flex-1">
          <Canvas />
          <EmptyState />
        </main>
        <RightSidebar />
      </div>
      <StatusBar />
      <CommandPalette />
      <ExportDialog />
      <ProjectsDialog />
    </div>
  );
}

export function Editor() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}
