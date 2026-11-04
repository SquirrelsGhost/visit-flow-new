import * as THREE from "three";
import { AREA_SHAPES, HOUSE_SHAPES, STREET_SEGMENTS } from "../revierWorld";

/**
 * Das Viertel: Boden mit feinem Raster, Häuser aus dunklem Glas mit hellen Kanten, Straßen als Lichtlinien,
 * die beiden Reviere als leuchtende Umrisse. `rise(k)` lässt die Häuser aus dem Boden wachsen (0 bis 1).
 */
export interface City {
  group: THREE.Group;
  rise: (k: number) => void;
  dispose: () => void;
}

const dummy = new THREE.Object3D();

function buildHouses(): { mesh: THREE.InstancedMesh; edges: THREE.LineSegments } {
  const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: "#151826", roughness: 0.35, metalness: 0.55, emissive: "#0b0d18" });
  const mesh = new THREE.InstancedMesh(box, mat, HOUSE_SHAPES.length);
  const edgeBase = new THREE.EdgesGeometry(box);
  const edgePos: number[] = [];
  const src = edgeBase.attributes.position;
  HOUSE_SHAPES.forEach((h, i) => {
    dummy.position.set(h.x, 0, h.z);
    dummy.rotation.set(0, h.rot, 0);
    dummy.scale.set(h.w, h.h, h.d);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    const v = new THREE.Vector3();
    for (let j = 0; j < (src?.count ?? 0); j++) {
      v.fromBufferAttribute(src as THREE.BufferAttribute, j).applyMatrix4(dummy.matrix);
      edgePos.push(v.x, v.y, v.z);
    }
  });
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePos, 3));
  const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: "#8b93c9", transparent: true, opacity: 0.32 }));
  return { mesh, edges };
}

function buildStreets(): THREE.LineSegments {
  const pos: number[] = [];
  STREET_SEGMENTS.forEach(([x1, z1, x2, z2]) => pos.push(x1, 0.05, z1, x2, 0.05, z2));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: "#f59e8b", transparent: true, opacity: 0.35 }));
}

function buildAreas(): THREE.Group {
  const group = new THREE.Group();
  AREA_SHAPES.forEach((area) => {
    const color = area.own ? "#ef4444" : "#8b5cf6";
    const pts = area.points.map(([x, z]) => new THREE.Vector3(x, 0.08, z));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 })));
    const shape = new THREE.Shape(area.points.map(([x, z]) => new THREE.Vector2(x, -z)));
    const fill = new THREE.Mesh(
      new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.025, depthWrite: false }),
    );
    fill.position.y = 0.03;
    group.add(fill);
  });
  return group;
}

function buildGround(): THREE.Group {
  const group = new THREE.Group();
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#07080f", roughness: 0.9 }));
  group.add(plane);
  const grid = new THREE.GridHelper(400, 100, "#1c2033", "#11131f");
  grid.position.y = 0.01;
  group.add(grid);
  return group;
}

export function createCity(): City {
  const group = new THREE.Group();
  const { mesh, edges } = buildHouses();
  const streets = buildStreets();
  const areas = buildAreas();
  const town = new THREE.Group();
  town.add(mesh, edges);
  group.add(buildGround(), streets, areas, town);

  return {
    group,
    rise: (k) => {
      town.scale.y = Math.max(k, 0.001);
      town.visible = k > 0.001;
      (streets.material as THREE.LineBasicMaterial).opacity = 0.35 * k;
      areas.children.forEach((child) => {
        const mat = (child as THREE.Mesh).material as THREE.Material & { opacity: number };
        mat.opacity = child instanceof THREE.Line ? 0.9 * k : 0.025 * k;
      });
    },
    dispose: () => {
      group.traverse((obj) => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
    },
  };
}
