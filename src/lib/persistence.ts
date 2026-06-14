import type { Project, ProjectFile } from "@/types/diagram";

const INDEX_KEY = "vraw:projects:index";
const projectKey = (id: string) => `vraw:project:${id}`;
const LAST_KEY = "vraw:last-project";

export interface ProjectMeta {
  id: string;
  name: string;
  kind: Project["kind"];
  updatedAt: number;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function listProjects(): ProjectMeta[] {
  if (typeof window === "undefined") return [];
  return safeParse<ProjectMeta[]>(localStorage.getItem(INDEX_KEY), []).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}

export function loadProjectById(id: string): Project | null {
  if (typeof window === "undefined") return null;
  return safeParse<Project | null>(localStorage.getItem(projectKey(id)), null);
}

export function saveProject(project: Project): void {
  if (typeof window === "undefined") return;
  const stamped: Project = { ...project, updatedAt: Date.now() };
  localStorage.setItem(projectKey(stamped.id), JSON.stringify(stamped));
  const index = listProjects().filter((p) => p.id !== stamped.id);
  index.push({
    id: stamped.id,
    name: stamped.name,
    kind: stamped.kind,
    updatedAt: stamped.updatedAt,
  });
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  localStorage.setItem(LAST_KEY, stamped.id);
}

export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(projectKey(id));
  const index = listProjects().filter((p) => p.id !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

export function getLastProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_KEY);
}

export function setLastProjectId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_KEY, id);
}

/** Serialize a project to a downloadable `.vraw.json` file blob. */
export function toProjectFile(project: Project): ProjectFile {
  return { version: 1, app: "vraw", project };
}

export function parseProjectFile(text: string): Project | null {
  const data = safeParse<Partial<ProjectFile>>(text, {});
  if (data && data.project && Array.isArray(data.project.nodes)) {
    return data.project as Project;
  }
  // Tolerate a bare Project object too.
  const bare = safeParse<Partial<Project>>(text, {});
  if (bare && Array.isArray(bare.nodes) && Array.isArray(bare.edges)) {
    return bare as Project;
  }
  return null;
}
