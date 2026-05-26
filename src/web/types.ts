export type MeshType = "cube" | "sphere";
export type ToolMode = "select" | "move" | "scale";
export type AppView = "library" | "editor";

export type SceneObjectData = {
  id: string;
  name: string;
  type: MeshType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
};

export type ProjectData = {
  id: string;
  name: string;
  updatedAt: string;
  thumbnail?: string;
  objects: SceneObjectData[];
};
