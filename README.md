# vraw — Diagram Editor

A fast, modern, Draw.io-inspired diagram editor built on Next.js 16 (App Router),
React 19, Tailwind v4, Zustand, and React Flow (`@xyflow/react`).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint (React Compiler rules)
```

No accounts, no backend — every diagram is stored locally in your browser.

## Features

**Canvas** — infinite pan/zoom, dot grid, snap-to-grid, marquee multi-select,
minimap, fit-to-screen, live cursor + zoom readout.

**Shapes** — basic (rectangle, ellipse, diamond, hexagon, cylinder, cloud, star…),
flowchart (process, decision, document, database, terminator…), UML
(class / interface / enum with attribute & method compartments, actor, use case),
ER entities with PK/FK columns, and network nodes (router, switch, firewall,
server, cloud, client). Drag any shape from the left palette onto the canvas.

**Connections** — drag from any side handle. Per-edge color, width, line style,
labels, animation, four routing modes (orthogonal / step / curved / straight)
and configurable start/end arrowheads (arrow, triangle, diamond, circle).

**Editing** — inline text editing (double-click), resize, copy/paste, duplicate,
multi-select, align & distribute, layer ordering, lock/unlock, and a full
undo/redo history.

**Templates** — login / order / approval flowcharts, a UML user-management model,
e-commerce & blog ER schemas, a project-planning mind map, and an office network.

**Persistence** — debounced autosave to `localStorage`, multiple named projects,
import/export as JSON.

**Export** — PNG (1×–4×), SVG (vector), and PDF, with an optional transparent
background.

**UX** — light/dark themes, command palette (`Ctrl/⌘ K`), keyboard shortcuts,
collapsible panels, and an empty-state onboarding card.

### Keyboard shortcuts

| Action | Keys |
| --- | --- |
| Command palette | `Ctrl/⌘ K` |
| Undo / Redo | `Ctrl/⌘ Z` / `Ctrl/⌘ Y` (or `⇧Z`) |
| Copy / Paste / Duplicate | `Ctrl/⌘ C` / `V` / `D` |
| Select all | `Ctrl/⌘ A` |
| Save | `Ctrl/⌘ S` |
| Lock / Unlock | `Ctrl/⌘ L` |
| Delete selection | `Delete` / `Backspace` |
| Clear selection | `Esc` |

## Architecture

```
src/
├── app/                  # Next.js App Router (page loads the editor client-side)
├── components/
│   ├── editor/           # Editor shell, status bar, empty state
│   ├── toolbar/          # Top navigation bar
│   ├── sidebar/          # Shape palette + properties panel
│   ├── canvas/           # React Flow canvas + markers
│   ├── nodes/            # Node & edge renderers + type registry
│   ├── dialogs/          # Command palette, export, projects
│   └── ui/               # Reusable primitives (fields, buttons)
├── hooks/                # theme, autosave, keyboard, inline-edit
├── stores/               # Zustand editor + UI stores
├── lib/                  # shapes, geometry, templates, persistence, export
└── types/                # shared diagram types
```

The editor renders client-side only (`ssr: false`) because it depends on the DOM,
`localStorage`, and React Flow's measuring.
# vraw
