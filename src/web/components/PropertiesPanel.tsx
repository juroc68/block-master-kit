import type { SceneObjectData } from "../types";
import { NumberField } from "./NumberField";

type PropertiesPanelProps = {
  object: SceneObjectData | null;
  onUpdateObject: (object: SceneObjectData) => void;
};

export function PropertiesPanel({ object, onUpdateObject }: PropertiesPanelProps) {
  if (!object) {
    return <p className="empty">Aucun objet selectionne.</p>;
  }

  const updateTuple = (key: "position" | "scale", index: number, value: number) => {
    const tuple = [...object[key]] as [number, number, number];
    tuple[index] = key === "scale" ? Math.max(0.05, value) : value;
    onUpdateObject({ ...object, [key]: tuple });
  };

  return (
    <>
      <div className="object-summary">
        <span className="object-chip">{object.type}</span>
        <strong>{object.name}</strong>
      </div>
      <label className="single-field">
        Nom
        <input value={object.name} onChange={(event) => onUpdateObject({ ...object, name: event.target.value })} />
      </label>
      <h3>Position</h3>
      <div className="field-grid">
        {["X", "Y", "Z"].map((label, index) => (
          <NumberField key={label} label={label} value={object.position[index]} onChange={(value) => updateTuple("position", index, value)} />
        ))}
      </div>
      <h3>Scale</h3>
      <div className="field-grid">
        {["X", "Y", "Z"].map((label, index) => (
          <NumberField key={label} label={label} value={object.scale[index]} onChange={(value) => updateTuple("scale", index, value)} />
        ))}
      </div>
      <label className="single-field">
        Couleur
        <input type="color" value={object.color} onChange={(event) => onUpdateObject({ ...object, color: event.target.value })} />
      </label>
    </>
  );
}
