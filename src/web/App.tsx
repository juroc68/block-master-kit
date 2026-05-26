import { useCallback, useEffect, useMemo, useState } from "react";
import { createDefaultProject, loadProjects, SELECTED_KEY, STORAGE_KEY } from "./data/projects";
import type { AppView, ProjectData } from "./types";
import { EditorView } from "./components/EditorView";
import { ProjectLibrary } from "./components/ProjectLibrary";

export function App() {
  const [projects, setProjects] = useState<ProjectData[]>(loadProjects);
  const [view, setView] = useState<AppView>("library");
  const [currentProjectId, setCurrentProjectId] = useState(() => localStorage.getItem(SELECTED_KEY) ?? projects[0]?.id);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const currentProject = useMemo(
    () => projects.find((project) => project.id === currentProjectId) ?? projects[0],
    [currentProjectId, projects],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem(SELECTED_KEY, currentProject.id);
    }
  }, [currentProject]);

  const updateProject = useCallback((nextProject: ProjectData) => {
    setProjects((items) =>
      items.map((project) =>
        project.id === nextProject.id ? { ...nextProject, updatedAt: new Date().toISOString() } : project,
      ),
    );
  }, []);

  const createProject = (name: string) => {
    const project = createDefaultProject(name);
    setProjects((items) => [project, ...items]);
    setCurrentProjectId(project.id);
    setSelectedObjectId(project.objects[0]?.id ?? null);
    setView("editor");
  };

  const openProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    setCurrentProjectId(project.id);
    setSelectedObjectId(project.objects[0]?.id ?? null);
    setView("editor");
  };

  const renameProject = (projectId: string, name: string) => {
    const nextName = name.trim();
    if (!nextName) {
      return;
    }

    setProjects((items) =>
      items.map((project) =>
        project.id === projectId ? { ...project, name: nextName, updatedAt: new Date().toISOString() } : project,
      ),
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects((items) => {
      const nextProjects = items.filter((project) => project.id !== projectId);
      if (nextProjects.length === 0) {
        const fallback = createDefaultProject("Demo");
        setCurrentProjectId(fallback.id);
        setSelectedObjectId(fallback.objects[0]?.id ?? null);
        return [fallback];
      }

      if (currentProjectId === projectId) {
        setCurrentProjectId(nextProjects[0].id);
        setSelectedObjectId(nextProjects[0].objects[0]?.id ?? null);
      }

      return nextProjects;
    });
    setView("library");
  };

  if (view === "library" || !currentProject) {
    return (
      <ProjectLibrary
        projects={projects}
        onCreateProject={createProject}
        onDeleteProject={deleteProject}
        onOpenProject={openProject}
        onRenameProject={renameProject}
      />
    );
  }

  return (
    <EditorView
      project={currentProject}
      selectedObjectId={selectedObjectId}
      onBackToLibrary={() => setView("library")}
      onProjectChange={updateProject}
      onSelectObject={setSelectedObjectId}
    />
  );
}
