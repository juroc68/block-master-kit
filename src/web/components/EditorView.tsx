import { Box, ChevronDown, Circle, Download, Eye, FolderOpen, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { exportProjectAsGlb } from "../three/exportProject";
import type { MeshType, ProjectData, SceneObjectData, ToolMode } from "../types";
import { AccordionSection } from "./AccordionSection";
import { Brand } from "./Brand";
import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { ThreeViewport } from "./ThreeViewport";
import { ToolButton } from "./ToolButton";

type EditorViewProps = {
  project: ProjectData;
  selectedObjectId: string | null;
  onBackToLibrary: () => void;
  onProjectChange: (project: ProjectData) => void;
  onSelectObject: (objectId: string | null) => void;
};

export function EditorView({ project, selectedObjectId, onBackToLibrary, onProjectChange, onSelectObject }: EditorViewProps) {
  const [activeTool, setActiveTool] = useState<ToolMode>("select");
  const [selectedShape, setSelectedShape] = useState<MeshType>("cube");
  const [shapePopoverOpen, setShapePopoverOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [openPanels, setOpenPanels] = useState({ project: true, layers: true, properties: true });
  const [status, setStatus] = useState("");
  const [resetViewNonce, setResetViewNonce] = useState(0);
  const captureThumbnailRef = useRef<(() => string | null) | null>(null);
  const shapePressTimeoutRef = useRef<number | null>(null);
  const shapeLongPressRef = useRef(false);

  const selectedObject = project.objects.find((object) => object.id === selectedObjectId) ?? null;

  const togglePanel = (panel: keyof typeof openPanels) => {
    setOpenPanels((current) => ({ ...current, [panel]: !current[panel] }));
  };

  useEffect(() => {
    return () => {
      clearShapePressTimer();
    };
  }, []);

  const updateAndSaveProject = useCallback(
    (nextProject: ProjectData) => {
      onProjectChange(nextProject);
      setStatus(`Sauvegarde: ${new Date().toLocaleTimeString()}`);
    },
    [onProjectChange],
  );

  const saveProject = () => {
    updateAndSaveProject({
      ...project,
      thumbnail: captureThumbnailRef.current?.() ?? project.thumbnail,
    });
  };

  const returnToLibrary = () => {
    updateAndSaveProject({
      ...project,
      thumbnail: captureThumbnailRef.current?.() ?? project.thumbnail,
    });
    onBackToLibrary();
  };

  const addObject = (type: MeshType) => {
    const count = project.objects.length;
    const object: SceneObjectData = {
      id: crypto.randomUUID(),
      name: `${type === "cube" ? "Cube" : "Sphere"} ${count + 1}`,
      type,
      position: [(count % 5) - 2, 0.5, Math.floor(count / 5)],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: type === "cube" ? "#37a9ff" : "#ff915c",
    };

    onSelectObject(object.id);
    updateAndSaveProject({ ...project, objects: [...project.objects, object] });
  };

  const clearShapePressTimer = () => {
    if (shapePressTimeoutRef.current !== null) {
      window.clearTimeout(shapePressTimeoutRef.current);
      shapePressTimeoutRef.current = null;
    }
  };

  const startShapePress = () => {
    shapeLongPressRef.current = false;
    clearShapePressTimer();
    shapePressTimeoutRef.current = window.setTimeout(() => {
      shapeLongPressRef.current = true;
      setShapePopoverOpen(true);
    }, 420);
  };

  const completeShapePress = () => {
    clearShapePressTimer();
    if (shapeLongPressRef.current) {
      return;
    }

    addObject(selectedShape);
  };

  const cancelShapePress = () => {
    clearShapePressTimer();
  };

  const chooseShape = (type: MeshType) => {
    setSelectedShape(type);
    setShapePopoverOpen(false);
  };

  const updateObject = (nextObject: SceneObjectData) => {
    updateAndSaveProject({
      ...project,
      objects: project.objects.map((object) => (object.id === nextObject.id ? nextObject : object)),
    });
  };

  const deleteSelectedObject = () => {
    if (!selectedObject) {
      return;
    }

    const nextObjects = project.objects.filter((object) => object.id !== selectedObject.id);
    onSelectObject(nextObjects[0]?.id ?? null);
    updateAndSaveProject({ ...project, objects: nextObjects });
  };

  const handleCaptureReady = useCallback((capture: (() => string | null) | null) => {
    captureThumbnailRef.current = capture;
  }, []);

  const exportProject = async () => {
    await exportProjectAsGlb(project);
    setFileMenuOpen(false);
  };

  return (
    <main className="editor-shell">
      <header className="topbar">
        <Brand />
        <div className="menu-root">
          <button className={`menu-tab ${fileMenuOpen ? "active" : ""}`} type="button" onClick={() => setFileMenuOpen((value) => !value)}>
            Fichier
          </button>
          {fileMenuOpen ? (
            <div className="file-menu">
              <button type="button" onClick={returnToLibrary}>
                <FolderOpen size={15} />
                Retour aux projets
              </button>
              <button
                type="button"
                onClick={() => {
                  saveProject();
                  setFileMenuOpen(false);
                }}
              >
                <Save size={15} />
                Sauvegarder
              </button>
              <button type="button" onClick={exportProject}>
                <Download size={15} />
                Exporter GLB
              </button>
            </div>
          ) : null}
        </div>
        <div className="toolbar-spacer" />
        <div className="status">{status}</div>
      </header>

      <section className="viewport">
        <ThreeViewport
          project={project}
          selectedObjectId={selectedObjectId}
          activeTool={activeTool}
          resetViewNonce={resetViewNonce}
          onCaptureReady={handleCaptureReady}
          onProjectChange={updateAndSaveProject}
          onSelectObject={onSelectObject}
          onToolChange={setActiveTool}
        />
        <div className="viewport-toolbar" aria-label="Outils">
          <div className="shape-tool">
            <button
              className={`tool-button shape-tool-button ${shapePopoverOpen ? "active" : ""}`}
              type="button"
              title={`Ajouter ${selectedShape === "cube" ? "un cube" : "une sphere"}. Appui long pour changer de forme.`}
              aria-label={`Ajouter ${selectedShape === "cube" ? "un cube" : "une sphere"}`}
              onPointerDown={startShapePress}
              onPointerUp={completeShapePress}
              onPointerCancel={cancelShapePress}
              onPointerLeave={cancelShapePress}
              onContextMenu={(event) => event.preventDefault()}
            >
              {selectedShape === "cube" ? <Box size={18} /> : <Circle size={18} />}
              <ChevronDown size={10} />
            </button>
            {shapePopoverOpen ? (
              <div className="shape-popover">
                <button className={selectedShape === "cube" ? "active" : ""} type="button" onClick={() => chooseShape("cube")}>
                  <Box size={16} />
                  Cube
                </button>
                <button className={selectedShape === "sphere" ? "active" : ""} type="button" onClick={() => chooseShape("sphere")}>
                  <Circle size={16} />
                  Sphere
                </button>
              </div>
            ) : null}
          </div>
          <ToolButton mode="select" activeTool={activeTool} label="Selectionner" onToolChange={setActiveTool} />
          <ToolButton mode="move" activeTool={activeTool} label="Deplacer XYZ" onToolChange={setActiveTool} />
          <ToolButton mode="scale" activeTool={activeTool} label="Scale XYZ" onToolChange={setActiveTool} />
        </div>
        <button
          className="viewport-action icon-button"
          type="button"
          title="Recentrer la camera"
          aria-label="Recentrer la camera"
          onClick={() => setResetViewNonce((value) => value + 1)}
        >
          <Eye size={18} />
        </button>
        <div className="viewport-badge">
          <span>{activeTool === "select" ? "Selection" : activeTool === "move" ? "Deplacement XYZ" : "Scale XYZ"}</span>
          <span>{project.objects.length} objets</span>
        </div>
      </section>

      <aside className="right-panel">
        <AccordionSection title="Projet" open={openPanels.project} onToggle={() => togglePanel("project")}>
          <div className="project-panel-header">
            <h1>{project.name}</h1>
            <span>{project.objects.length} objets</span>
          </div>
        </AccordionSection>
        <AccordionSection title="Calques" open={openPanels.layers} meta={project.objects.length} onToggle={() => togglePanel("layers")}>
          <LayersPanel project={project} selectedObjectId={selectedObjectId} onSelectObject={onSelectObject} />
        </AccordionSection>
        <AccordionSection
          title="Proprietes"
          open={openPanels.properties}
          actions={
            selectedObject ? (
              <button className="danger-tab" type="button" onClick={deleteSelectedObject}>
                <Trash2 size={13} />
                Delete
              </button>
            ) : null
          }
          onToggle={() => togglePanel("properties")}
        >
          <PropertiesPanel object={selectedObject} onUpdateObject={updateObject} />
        </AccordionSection>
      </aside>
    </main>
  );
}
