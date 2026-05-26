import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import type { ProjectData, SceneObjectData } from "../types";
import { applyObjectToMesh } from "./objects";

export async function exportProjectAsGlb(project: ProjectData) {
  const group = new THREE.Group();
  group.name = project.name;

  for (const object of project.objects) {
    group.add(createExportMesh(object));
  }

  const exporter = new GLTFExporter();
  const result = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      group,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          resolve(gltf);
        } else {
          reject(new Error("GLB export returned JSON instead of binary data."));
        }
      },
      (error) => reject(error),
      { binary: true },
    );
  });

  downloadBlob(new Blob([result], { type: "model/gltf-binary" }), `${safeFileName(project.name)}.glb`);
}

function createExportMesh(object: SceneObjectData) {
  const geometry = object.type === "cube" ? new THREE.BoxGeometry(1, 1, 1) : new THREE.SphereGeometry(0.55, 32, 16);
  const material = new THREE.MeshStandardMaterial({
    color: object.color,
    roughness: 0.6,
    metalness: 0.08,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = object.name;
  applyObjectToMesh(object, mesh);
  return mesh;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function safeFileName(value: string) {
  return value.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "block-master-kit-export";
}
