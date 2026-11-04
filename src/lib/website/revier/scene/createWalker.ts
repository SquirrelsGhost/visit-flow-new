import * as THREE from "three";
import { ROUTE } from "../revierData";
import { housePos, TEAM_WORLD, type Vec2 } from "../revierWorld";

/**
 * "Du" im Revier: ein rotes Licht, das von Tür zu Tür geht und eine leuchtende Spur zieht,
 * dazu Enes als violette Kugel an deiner Seite und die Kollegen als farbige Lichter im Nachbarrevier.
 */
export interface Walker {
  group: THREE.Group;
  set: (pos: Vec2, visited: number, show: number, coach: number, team: number, now: number) => void;
  /** Bildschirmanker (Weltkoordinaten) für die schwebenden Beschriftungen. */
  anchors: { walker: THREE.Vector3; coach: THREE.Vector3; team: THREE.Vector3[] };
  dispose: () => void;
}

const LIGHT = { me: 90, coach: 40, mate: 50 } as const;

function orb(color: string, r: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshBasicMaterial({ color, transparent: true }));
}

export function createWalker(): Walker {
  const group = new THREE.Group();
  const me = orb("#ff4d4d", 0.75);
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.7, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#ef4444", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  const light = new THREE.PointLight("#ff3b3b", 0, 26, 1.4);
  const coach = orb("#c084fc", 0.5);
  // Lichter bleiben immer in der Szene und werden über die Stärke an- und ausgeschaltet:
  // ein unsichtbares Licht ändert die Lichtzahl, und three.js übersetzt dann alle Shader neu (spürbares Stocken beim Scrollen)
  const coachLight = new THREE.PointLight("#a855f7", 0, 14, 1.5);

  const trailPts = ROUTE.map(([house]) => {
    const [x, z] = housePos(house);
    return new THREE.Vector3(x, 0.25, z);
  });
  const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPts);
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: "#ff6b6b", transparent: true, opacity: 0.95 }));

  const mates = TEAM_WORLD.map((m) => {
    const mesh = orb(m.color, 0.6);
    const glow = new THREE.PointLight(m.color, 0, 18, 1.5);
    group.add(mesh, glow);
    return { mesh, glow };
  });

  group.add(me, halo, light, coach, coachLight, trail);
  const anchors = { walker: new THREE.Vector3(), coach: new THREE.Vector3(), team: mates.map(() => new THREE.Vector3()) };

  return {
    group,
    anchors,
    set: (pos, visited, show, coachK, teamK, now) => {
      const [x, z] = pos;
      const bob = Math.sin(now / 260) * 0.15;
      me.position.set(x, 0.9 + bob, z);
      halo.position.set(x, 0.15, z);
      halo.scale.setScalar(1 + ((now / 900) % 1) * 1.2);
      (halo.material as THREE.MeshBasicMaterial).opacity = show * (1 - ((now / 900) % 1));
      light.position.set(x, 2.2, z);
      me.visible = halo.visible = show > 0.01;
      light.intensity = me.visible ? LIGHT.me : 0;
      (me.material as THREE.MeshBasicMaterial).opacity = show;
      trailGeo.setDrawRange(0, Math.max(visited, 0));
      trail.visible = show > 0.01;
      anchors.walker.set(x, 2.4, z);

      const a = now / 700;
      coach.position.set(x + Math.cos(a) * 2.2, 2.4 + Math.sin(a * 1.7) * 0.4, z + Math.sin(a) * 2.2);
      coach.visible = coachK > 0.01;
      coach.scale.setScalar(Math.max(coachK, 0.001));
      coachLight.position.copy(coach.position);
      coachLight.intensity = coach.visible ? LIGHT.coach : 0;
      anchors.coach.copy(coach.position).y += 1.2;

      mates.forEach(({ mesh, glow }, i) => {
        const base = TEAM_WORLD[i]?.at ?? [0, 0];
        const wobble = now / (1400 + i * 300);
        mesh.position.set(base[0] + Math.sin(wobble) * 3, 0.9, base[1] + Math.cos(wobble * 0.8) * 3);
        mesh.visible = teamK > 0.01;
        mesh.scale.setScalar(Math.max(teamK, 0.001));
        glow.position.copy(mesh.position);
        glow.intensity = mesh.visible ? LIGHT.mate : 0;
        anchors.team[i]?.copy(mesh.position).setY(2.6);
      });
    },
    dispose: () => {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose();
      });
    },
  };
}
