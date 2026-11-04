import * as THREE from "three";

/**
 * Fahrtenbuch und Sicherheit im Bild: Ein Auto-Licht fährt über eine leuchtende Straße ins Revier
 * (die Spur zeichnet sich mit), danach legt sich eine smaragdgrüne Schutzkuppel über das Viertel.
 */
export interface Extras {
  group: THREE.Group;
  set: (drive: number, shield: number, now: number) => void;
  anchors: { car: THREE.Vector3; shield: THREE.Vector3 };
  dispose: () => void;
}

const ROAD = new THREE.CatmullRomCurve3([
  new THREE.Vector3(190, 0.3, 70),
  new THREE.Vector3(130, 0.3, 64),
  new THREE.Vector3(84, 0.3, 40),
  new THREE.Vector3(52, 0.3, 22),
  new THREE.Vector3(30, 0.3, 6),
]);
const SAMPLES = 200;
const HEADLIGHT = 160;

export function createExtras(): Extras {
  const group = new THREE.Group();
  const roadGeo = new THREE.BufferGeometry().setFromPoints(ROAD.getPoints(SAMPLES));
  const road = new THREE.Line(roadGeo, new THREE.LineBasicMaterial({ color: "#5eead4", transparent: true }));
  const car = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 3), new THREE.MeshBasicMaterial({ color: "#99f6e4" }));
  // Licht nicht am Auto (das ein- und ausgeblendet wird), sondern immer in der Szene; an/aus über die Stärke,
  // sonst übersetzt three.js bei jedem Ein- und Ausblenden alle Shader neu
  const headlight = new THREE.PointLight("#5eead4", 0, 30, 1.4);

  const domeMat = new THREE.MeshBasicMaterial({ color: "#34d399", wireframe: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const dome = new THREE.Mesh(new THREE.IcosahedronGeometry(58, 3), domeMat);
  const shellMat = new THREE.MeshBasicMaterial({ color: "#10b981", transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(57.5, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), shellMat);
  group.add(road, car, headlight, dome, shell);
  const anchors = { car: new THREE.Vector3(), shield: new THREE.Vector3(0, 58, 0) };
  const tangent = new THREE.Vector3();
  const aim = new THREE.Vector3();

  return {
    group,
    anchors,
    set: (drive, shieldK, now) => {
      const showDrive = drive > 0.001 && shieldK < 0.999;
      road.visible = car.visible = showDrive;
      const k = Math.min(drive * 1.15, 1);
      roadGeo.setDrawRange(0, Math.floor(k * SAMPLES) + 1);
      ROAD.getPointAt(k, car.position);
      ROAD.getTangentAt(k, tangent);
      car.lookAt(aim.copy(car.position).add(tangent));
      car.position.y = 0.6;
      headlight.position.copy(car.position);
      headlight.intensity = showDrive ? HEADLIGHT : 0;
      anchors.car.copy(car.position).setY(3.4);
      (road.material as THREE.LineBasicMaterial).opacity = 0.9 * (1 - shieldK);

      dome.visible = shell.visible = shieldK > 0.001;
      const grow = Math.min(shieldK * 2, 1);
      dome.scale.set(grow, grow * 0.62, grow);
      shell.scale.set(grow, grow * 0.62, grow);
      dome.rotation.y = now / 9000;
      domeMat.opacity = 0.4 * Math.min(shieldK * 1.5, 1);
      shellMat.opacity = 0.1 * Math.min(shieldK * 1.5, 1);
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
