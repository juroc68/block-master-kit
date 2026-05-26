import { Box, Circle } from "lucide-react";
import type { ProjectData } from "../types";

type LayersPanelProps = {
  project: ProjectData;
  selectedObjectId: string | null;
  onSelectObject: (objectId: string | null) => void;
};

export function LayersPanel({ project, selectedObjectId, onSelectObject }: LayersPanelProps) {
  return (
    <div className="object-list">
      {project.objects.length === 0 ? <p className="empty">Aucun objet dans la scene.</p> : null}
      {project.objects.length > 0
        ? project.objects.map((object) => (
            <button
              key={object.id}
              className={`object-item ${object.id === selectedObjectId ? "active" : ""}`}
              type="button"
              onClick={() => onSelectObject(object.id)}
            >
              <span className={`layer-icon ${object.type}`} aria-hidden="true">
                {object.type === "cube" ? <Box size={15} /> : <Circle size={15} />}
              </span>
              <span className="item-title">{object.name}</span>
              <span className="item-meta">{object.type}</span>
            </button>
          ))
        : null}
    </div>
  );
}
