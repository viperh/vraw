import { create } from "zustand";

/** Active click-to-connect gesture: an arrow was clicked on `sourceId`. */
export interface ConnectState {
  sourceId: string;
  handle: "t" | "r" | "b" | "l";
}

interface UiState {
  cursor: { x: number; y: number };
  leftOpen: boolean;
  rightOpen: boolean;
  paletteOpen: boolean;
  exportOpen: boolean;
  projectsOpen: boolean;
  connect: ConnectState | null;
  setCursor: (x: number, y: number) => void;
  toggleLeft: () => void;
  toggleRight: () => void;
  setPalette: (v: boolean) => void;
  setExport: (v: boolean) => void;
  setProjects: (v: boolean) => void;
  startConnect: (sourceId: string, handle: ConnectState["handle"]) => void;
  cancelConnect: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  cursor: { x: 0, y: 0 },
  leftOpen: true,
  rightOpen: true,
  paletteOpen: false,
  exportOpen: false,
  projectsOpen: false,
  connect: null,
  setCursor: (x, y) => set({ cursor: { x, y } }),
  toggleLeft: () => set((s) => ({ leftOpen: !s.leftOpen })),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  setPalette: (v) => set({ paletteOpen: v }),
  setExport: (v) => set({ exportOpen: v }),
  setProjects: (v) => set({ projectsOpen: v }),
  startConnect: (sourceId, handle) => set({ connect: { sourceId, handle } }),
  cancelConnect: () => set({ connect: null }),
}));
