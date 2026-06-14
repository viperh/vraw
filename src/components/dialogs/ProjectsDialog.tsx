"use client";

import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { X, FilePlus2, Trash2, FileText } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useUiStore } from "@/stores/ui-store";
import {
  listProjects,
  loadProjectById,
  deleteProject,
  saveProject,
} from "@/lib/persistence";

function ProjectsList() {
  const setOpen = useUiStore((s) => s.setProjects);
  const currentId = useEditorStore((s) => s.projectId);
  const { fitView } = useReactFlow();
  const [projects, setProjects] = useState(() => listProjects());

  const openProject = (id: string) => {
    const ed = useEditorStore.getState();
    if (ed.dirty) {
      saveProject(ed.toProject());
    }
    const project = loadProjectById(id);
    if (project) {
      ed.loadProject(project);
      setTimeout(() => fitView({ padding: 0.3 }), 50);
      setOpen(false);
    }
  };

  const remove = (id: string) => {
    deleteProject(id);
    setProjects(listProjects());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Your projects</h2>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {projects.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No saved projects yet. Your work autosaves as you edit.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 hover:border-border hover:bg-surface-2"
                >
                  <FileText size={16} className="shrink-0 text-accent" />
                  <button
                    type="button"
                    onClick={() => openProject(p.id)}
                    className="flex min-w-0 flex-1 flex-col text-left"
                  >
                    <span className="truncate text-sm font-medium">
                      {p.name}
                      {p.id === currentId && (
                        <span className="ml-2 text-[10px] text-accent">current</span>
                      )}
                    </span>
                    <span className="text-[11px] text-muted">
                      {new Date(p.updatedAt).toLocaleString()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => {
              const ed = useEditorStore.getState();
              if (ed.dirty) saveProject(ed.toProject());
              ed.newProject();
              setOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            <FilePlus2 size={16} /> New diagram
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsDialog() {
  const open = useUiStore((s) => s.projectsOpen);
  return open ? <ProjectsList /> : null;
}
