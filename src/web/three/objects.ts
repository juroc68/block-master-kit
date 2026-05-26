import * as THREE from "three";
import type { SceneObjectData } from "../types";

export function applyObjectToMesh(object: SceneObjectData, mesh: THREE.Mesh) {
  mesh.position.fromArray(object.position);
  mesh.rotation.set(object.rotation[0], object.rotation[1], object.rotation[2]);
  mesh.scale.fromArray(object.scale);
}

export function vectorToTuple(vector: THREE.Vector3): [number, number, number] {
  return [vector.x, vector.y, vector.z];
}

export function disposeMesh(mesh: THREE.Mesh) {
  const material = mesh.material;
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
  } else {
    material.dispose();
  }
}

export function createSceneMesh(object: SceneObjectData, geometries: { cube: THREE.BoxGeometry; sphere: THREE.SphereGeometry }) {
  const geometry = object.type === "cube" ? geometries.cube : geometries.sphere;
  const material = new THREE.MeshStandardMaterial({
    color: object.color,
    roughness: 0.6,
    metalness: 0.08,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = object.name;
  mesh.userData.objectId = object.id;
  applyObjectToMesh(object, mesh);
  return mesh;
}
