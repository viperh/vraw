"use client";

import dynamic from "next/dynamic";

// The editor relies on the DOM (React Flow measuring, localStorage, canvas
// rendering), so it is loaded client-side only.
const Editor = dynamic(
  () => import("@/components/editor/Editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background text-sm text-muted">
        Loading editor…
      </div>
    ),
  },
);

export default function Home() {
  return (
    <div className="h-full w-full">
      <Editor />
    </div>
  );
}
