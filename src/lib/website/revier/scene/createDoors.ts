import * as THREE from "three";
import type { DoorStatus } from "../revierData";
import { HOUSE_SHAPES, STATUS_COLOR } from "../revierWorld";

/**
 * Türen als Lichtflecken vor jedem Haus. Eine besuchte Tür leuchtet in ihrer Statusfarbe auf,
 * ein Verkauf schickt zusätzlich einen grünen Lichtstrahl in den Himmel.
 */
export interface Doors {
  group: THREE.Group;
  /** Gewünschter Zustand je Haus (null = noch nicht besucht). Liefert die neu aufgeleuchteten Türen. */
  apply: (states: (DoorStatus | null)[], now: number) => DoorStatus[];
  tick: (now: number) => void;
  dispose: () => void;
}

const N = HOUSE_SHAPES.length;
const dummy = new THREE.Object3D();
const BEAM_H = 26;
/** Aufleuchten dauert 0.4 s, der Lichtstrahl wächst 0.56 s; etwas Puffer dazu. */
const SETTLE_MS = 650;

export function createDoors(): Doors {
  const group = new THREE.Group();
  const padMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
  const pads = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2), padMat, N);
  const beamMat = new THREE.MeshBasicMaterial({ color: "#22c55e", transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
  const beams = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.22, BEAM_H, 10, 1, true).translate(0, BEAM_H / 2, 0), beamMat, N);
  pads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  beams.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(pads, beams);

  const current: (DoorStatus | null)[] = new Array(N).fill(null);
  // Matrizen nur neu schreiben (und hochladen), solange etwas aufleuchtet oder wächst
  // 0: der erste tick legt alle Türen und Strahlen auf ihren Ruhezustand (sonst stünden sie in Einheitsgröße da)
  let settleAt = 0;
  const litAt = new Float32Array(N);
  const color = new THREE.Color();
  for (let i = 0; i < N; i++) pads.setColorAt(i, color.set("#000000"));

  const apply = (states: (DoorStatus | null)[], now: number) => {
    const fresh: DoorStatus[] = [];
    let changed = false;
    for (let i = 0; i < N; i++) {
      const next = states[i] ?? null;
      if (next === current[i]) continue;
      current[i] = next;
      litAt[i] = now;
      changed = true;
      if (next) fresh.push(next);
      settleAt = Math.max(settleAt, now + SETTLE_MS);
      pads.setColorAt(i, color.set(next ? STATUS_COLOR[next] : "#000000"));
    }
    if (changed && pads.instanceColor) pads.instanceColor.needsUpdate = true;
    return fresh;
  };

  const tick = (now: number) => {
    beamMat.opacity = 0.32 + Math.sin(now / 400) * 0.08;
    if (settleAt < 0) return;
    // Ein letzter Durchlauf nach dem Ende der Animation setzt alle Werte exakt auf ihren Endzustand
    if (now > settleAt) settleAt = -1;
    for (let i = 0; i < N; i++) {
      const h = HOUSE_SHAPES[i];
      const status = current[i];
      if (!h) continue;
      const age = (now - (litAt[i] ?? 0)) / 1000;
      const pop = status ? 1 + Math.max(0, 1 - age * 2.5) * 1.6 : 0;
      dummy.position.set(h.x, 0.12, h.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(status ? 0.95 * pop : 0.0001);
      dummy.updateMatrix();
      pads.setMatrixAt(i, dummy.matrix);
      const beam = status === "sale" ? Math.min(age * 1.8, 1) : 0;
      dummy.position.set(h.x, h.h, h.z);
      dummy.scale.set(beam || 0.0001, beam || 0.0001, beam || 0.0001);
      dummy.updateMatrix();
      beams.setMatrixAt(i, dummy.matrix);
    }
    pads.instanceMatrix.needsUpdate = true;
    beams.instanceMatrix.needsUpdate = true;
  };

  return {
    group,
    apply,
    tick,
    dispose: () => {
      pads.geometry.dispose();
      beams.geometry.dispose();
      padMat.dispose();
      beamMat.dispose();
    },
  };
}
