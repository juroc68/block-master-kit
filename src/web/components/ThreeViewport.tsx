import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { getSelectedSceneObject, updateProjectObject } from "../data/projects";
import { applyObjectToMesh, createSceneMesh, disposeMesh, vectorToTuple } from "../three/objects";
import type { ProjectData, SceneObjectData, ToolMode } from "../types";

type ThreeViewportProps = {
  project: ProjectData;
  selectedObjectId: string | null;
  activeTool: ToolMode;
  resetViewNonce: number;
  onCaptureReady: (capture: (() => string | null) | null) => void;
  onProjectChange: (project: ProjectData) => void;
  onSelectObject: (objectId: string | null) => void;
  onToolChange: (tool: ToolMode) => void;
};

export function ThreeViewport({
  project,
  selectedObjectId,
  activeTool,
  resetViewNonce,
  onCaptureReady,
  onProjectChange,
  onSelectObject,
  onToolChange,
}: ThreeViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const meshesRef = useRef(new Map<string, THREE.Mesh>());
  const axisHelperRef = useRef<THREE.AxesHelper | null>(null);
  const frameRef = useRef<number | null>(null);
  const projectRef = useRef(project);
  const selectedObjectIdRef = useRef(selectedObjectId);
  const activeToolRef = useRef(activeTool);
  const cubeGeometryRef = useRef(new THREE.BoxGeometry(1, 1, 1));
  const sphereGeometryRef = useRef(new THREE.SphereGeometry(0.55, 32, 16));

  projectRef.current = project;
  selectedObjectIdRef.current = selectedObjectId;
  activeToolRef.current = activeTool;

  const objectSignature = project.objects.map((object) => `${object.id}:${object.type}`).join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setClearColor(0x0e1013, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(5, 4, 7);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    scene.add(new THREE.GridHelper(12, 12, 0x46515f, 0x29313b));
    const axisHelper = new THREE.AxesHelper(1.35);
    axisHelper.visible = false;
    scene.add(axisHelper);

    const light = new THREE.DirectionalLight(0xffffff, 2.3);
    light.position.set(4, 6, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setSize(0.9);
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });
    transformControls.addEventListener("objectChange", () => {
      const object = getSelectedSceneObject(projectRef.current, selectedObjectIdRef.current);
      const mesh = selectedObjectIdRef.current ? meshesRef.current.get(selectedObjectIdRef.current) : null;
      if (!object || !mesh) {
        return;
      }

      const nextObject: SceneObjectData = {
        ...object,
        position: vectorToTuple(mesh.position),
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
        scale: vectorToTuple(mesh.scale),
      };
      axisHelper.position.copy(mesh.position);
      updateSelectionHighlight();
      onProjectChange(updateProjectObject(projectRef.current, nextObject));
    });
    scene.add(transformControls.getHelper());

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    controlsRef.current = controls;
    transformControlsRef.current = transformControls;
    axisHelperRef.current = axisHelper;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
    };

    const capture = () => {
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL("image/webp", 0.72);
    };

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    onCaptureReady(capture);

    return () => {
      window.removeEventListener("resize", resize);
      onCaptureReady(null);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      transformControls.dispose();
      controls.dispose();
      cubeGeometryRef.current.dispose();
      sphereGeometryRef.current.dispose();
      for (const mesh of meshesRef.current.values()) {
        disposeMesh(mesh);
      }
      renderer.dispose();
    };
  }, [onCaptureReady, onProjectChange]);

  useEffect(() => {
    hydrateScene();
  }, [project.id, objectSignature]);

  useEffect(() => {
    updateMeshesFromProject();
  }, [project]);

  useEffect(() => {
    updateTransformControls();
  }, [selectedObjectId, activeTool, objectSignature]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) {
      return;
    }

    camera.position.set(5, 4, 7);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [resetViewNonce]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        return;
      }

      const toolHandlers: Record<string, () => void> = {
        r: () => onToolChange("scale"),
        v: () => onToolChange("select"),
        w: () => onToolChange("move"),
      };
      const toolHandler = toolHandlers[event.key.toLowerCase()];
      if (toolHandler) {
        toolHandler();
        return;
      }

      const object = getSelectedSceneObject(projectRef.current, selectedObjectIdRef.current);
      if (!object) {
        return;
      }

      const step = event.shiftKey ? 0.5 : 0.1;
      const nextObject = { ...object };
      const handlers: Record<string, () => void> = {
        ArrowDown: () => (nextObject.position = [object.position[0], object.position[1], object.position[2] + step]),
        ArrowLeft: () => (nextObject.position = [object.position[0] - step, object.position[1], object.position[2]]),
        ArrowRight: () => (nextObject.position = [object.position[0] + step, object.position[1], object.position[2]]),
        ArrowUp: () => (nextObject.position = [object.position[0], object.position[1], object.position[2] - step]),
        PageDown: () => (nextObject.position = [object.position[0], object.position[1] - step, object.position[2]]),
        PageUp: () => (nextObject.position = [object.position[0], object.position[1] + step, object.position[2]]),
      };
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        onProjectChange({
          ...projectRef.current,
          objects: projectRef.current.objects.filter((item) => item.id !== object.id),
        });
        onSelectObject(projectRef.current.objects.find((item) => item.id !== object.id)?.id ?? null);
        return;
      }

      const handler = handlers[event.key];
      if (!handler) {
        return;
      }

      event.preventDefault();
      handler();
      onProjectChange(updateProjectObject(projectRef.current, nextObject));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onProjectChange, onSelectObject, onToolChange]);

  const hydrateScene = () => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }

    for (const mesh of meshesRef.current.values()) {
      scene.remove(mesh);
      disposeMesh(mesh);
    }
    meshesRef.current.clear();

    for (const object of projectRef.current.objects) {
      const mesh = createSceneMesh(object, {
        cube: cubeGeometryRef.current,
        sphere: sphereGeometryRef.current,
      });
      meshesRef.current.set(object.id, mesh);
      scene.add(mesh);
    }
    updateTransformControls();
  };

  const updateMeshesFromProject = () => {
    for (const object of project.objects) {
      const mesh = meshesRef.current.get(object.id);
      if (!mesh) {
        continue;
      }
      applyObjectToMesh(object, mesh);
      mesh.name = object.name;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.color.set(object.color);
    }
    updateAxisHelper();
    updateSelectionHighlight();
  };

  const updateTransformControls = () => {
    const transformControls = transformControlsRef.current;
    const mesh = selectedObjectIdRef.current ? meshesRef.current.get(selectedObjectIdRef.current) : null;
    if (!transformControls) {
      return;
    }

    updateAxisHelper();
    updateSelectionHighlight();
    if (!mesh || activeToolRef.current === "select") {
      transformControls.detach();
      return;
    }

    transformControls.attach(mesh);
    transformControls.setMode(activeToolRef.current === "move" ? "translate" : "scale");
  };

  const updateAxisHelper = () => {
    const axisHelper = axisHelperRef.current;
    const mesh = selectedObjectIdRef.current ? meshesRef.current.get(selectedObjectIdRef.current) : null;
    if (!axisHelper) {
      return;
    }

    axisHelper.visible = Boolean(mesh);
    if (mesh) {
      axisHelper.position.copy(mesh.position);
    }
  };

  const updateSelectionHighlight = () => {
    for (const [objectId, mesh] of meshesRef.current) {
      const material = mesh.material as THREE.MeshStandardMaterial;
      const isSelected = objectId === selectedObjectIdRef.current;
      material.emissive.copy(isSelected ? material.color : new THREE.Color(0x000000));
      material.emissiveIntensity = isSelected ? 0.16 : 0;
    }
  };

  const selectByPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current || !canvasRef.current) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, cameraRef.current);
    const hits = raycaster.intersectObjects([...meshesRef.current.values()], false);
    const hitObjectId = hits[0]?.object.userData.objectId as string | undefined;
    if (hitObjectId) {
      onSelectObject(hitObjectId);
      return;
    }

    if (activeToolRef.current === "select") {
      onSelectObject(null);
    }
  };

  return <canvas id="viewport" ref={canvasRef} onPointerDown={selectByPointer} />;
}
