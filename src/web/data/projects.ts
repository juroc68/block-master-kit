import type { ProjectData, SceneObjectData } from "../types";

export const STORAGE_KEY = "block-master-kit.projects.v1";
export const SELECTED_KEY = "block-master-kit.selected-project.v1";

export function loadProjects(): ProjectData[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [createDefaultProject("Demo")];
  }

  try {
    const parsed = JSON.parse(raw) as ProjectData[];
    return parsed.length > 0 ? parsed : [createDefaultProject("Demo")];
  } catch {
    return [createDefaultProject("Demo")];
  }
}

export function createDefaultProject(name: string): ProjectData {
  return {
    id: crypto.randomUUID(),
    name,
    updatedAt: new Date().toISOString(),
    objects: [
      {
        id: crypto.randomUUID(),
        name: "Cube 1",
        type: "cube",
        position: [-1, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: "#37a9ff",
      },
      {
        id: crypto.randomUUID(),
        name: "Sphere 1",
        type: "sphere",
        position: [1, 0.55, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: "#ff915c",
      },
    ],
  };
}

export function getSelectedSceneObject(project: ProjectData, selectedObjectId: string | null) {
  return project.objects.find((object) => object.id === selectedObjectId) ?? null;
}

export function updateProjectObject(project: ProjectData, nextObject: SceneObjectData): ProjectData {
  return {
    ...project,
    objects: project.objects.map((object) => (object.id === nextObject.id ? nextObject : object)),
  };
}
