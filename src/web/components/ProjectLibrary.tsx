import { FolderOpen, Pencil, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ProjectData } from "../types";
import { Brand } from "./Brand";

type ProjectLibraryProps = {
  projects: ProjectData[];
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenProject: (projectId: string) => void;
  onRenameProject: (projectId: string, name: string) => void;
};

export function ProjectLibrary({ projects, onCreateProject, onDeleteProject, onOpenProject, onRenameProject }: ProjectLibraryProps) {
  const [projectName, setProjectName] = useState("Nouveau projet");
  const [activeSettingsId, setActiveSettingsId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");

  return (
    <main className="library-shell">
      <header className="library-header">
        <Brand />
        <div className="library-count">{projects.length} projets</div>
      </header>

      <section className="library-content">
        <div className="library-title-row">
          <div>
            <h1>Projets</h1>
            <p>Choisis une scene a editer ou demarre un nouveau projet.</p>
          </div>
          <form
            className="new-project-form"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateProject(projectName.trim() || "Nouveau projet");
            }}
          >
            <input value={projectName} aria-label="Nom du projet" onChange={(event) => setProjectName(event.target.value)} />
            <button type="submit">Creer</button>
          </form>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <button key={project.id} className="project-card" type="button" onClick={() => onOpenProject(project.id)}>
              <ProjectPreview project={project} />
              <span className="project-card-settings">
                <button
                  className="project-settings-button"
                  type="button"
                  title="Reglages du projet"
                  aria-label={`Reglages du projet ${project.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveSettingsId((value) => (value === project.id ? null : project.id));
                    setEditingProjectId(null);
                  }}
                >
                  <Settings size={15} />
                </button>
                {activeSettingsId === project.id ? (
                  <span className="project-settings-menu" onClick={(event) => event.stopPropagation()}>
                    {editingProjectId === project.id ? (
                      <form
                        className="project-rename-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          onRenameProject(project.id, editingProjectName);
                          setEditingProjectId(null);
                          setActiveSettingsId(null);
                        }}
                      >
                        <input
                          autoFocus
                          value={editingProjectName}
                          aria-label="Nouveau nom du projet"
                          onChange={(event) => setEditingProjectName(event.target.value)}
                        />
                        <button type="submit">OK</button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProjectId(project.id);
                            setEditingProjectName(project.name);
                          }}
                        >
                          <Pencil size={14} />
                          Editer
                        </button>
                        <button
                          className="danger-menu-item"
                          type="button"
                          onClick={() => {
                            onDeleteProject(project.id);
                            setActiveSettingsId(null);
                          }}
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </>
                    )}
                  </span>
                ) : null}
              </span>
              <span className="project-card-footer">
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.objects.length} objets</small>
                </span>
                <span className="project-open">
                  <FolderOpen size={16} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProjectPreview({ project }: { project: ProjectData }) {
  if (project.thumbnail) {
    return <img className="project-thumbnail" src={project.thumbnail} alt="" />;
  }

  return (
    <div className="project-thumbnail placeholder-thumbnail">
      <div className="preview-grid" />
      <span>{project.objects.length}</span>
    </div>
  );
}
