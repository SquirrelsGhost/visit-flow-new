import * as THREE from "three";
import { LOGO, LOGO_BG, LOGO_COLORS, NORTH_STOPS, SOUTH_STOPS } from "../../logoSpec";
import { discGeometry, glowGeometry, LOGO_LAYER, needleGeometry, needleOutline, ringGeometry } from "./compassLogo";

/**
 * Das Kompass-Logo, flach über dem Viertel: genau favicon.svg (Scheibe, leuchtender Außenring, 12 Striche,
 * Innenring, Nadel auf 45°). Von oben gesehen ist es das Logo; beim Abtauchen weitet es sich zur Grenze des Reviers.
 */
export interface Compass {
  group: THREE.Group;
  /** k = 1 voll sichtbar, 0 ausgeblendet; spread weitet den Ring; spin dreht die Nadel. */
  set: (k: number, spread: number, spin: number) => void;
  dispose: () => void;
}

/** Radius des Außenrings in der Welt; daraus der Maßstab für alle Logo-Maße. */
const R = 46;
const SCALE = R / LOGO.outer;
const LIFT = 1;

/** Ebene des Logos: height in Welt-Einheiten über dem Boden, order legt die Zeichenreihenfolge fest. */
function layer(geo: THREE.BufferGeometry, mat: THREE.Material, height: number, order: number): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = height / SCALE;
  mesh.renderOrder = order;
  return mesh;
}

function material(opts: THREE.MeshBasicMaterialParameters = {}): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, ...opts });
}

export function createCompass(): Compass {
  const painted = material({ vertexColors: true });
  const glowMat = material({ vertexColors: true });
  const discMat = material({ vertexColors: true });
  const tickMat = material({ color: LOGO_COLORS.tick });
  const dotMat = material({ color: LOGO_BG.center });
  const dotRingMat = material({ color: LOGO_COLORS.tick });
  const northEdge = material({ color: LOGO_COLORS.northStroke });
  const southEdge = material({ color: LOGO_COLORS.southStroke });

  const ticks = new THREE.Group();
  const tickGeo = new THREE.PlaneGeometry(LOGO.tickStroke, LOGO.tickTo - LOGO.tickFrom);
  const mid = (LOGO.tickFrom + LOGO.tickTo) / 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tick = layer(tickGeo, tickMat, 0.35, 3);
    tick.position.x = Math.sin(a) * mid;
    tick.position.y = Math.cos(a) * mid;
    tick.rotation.z = -a;
    ticks.add(tick);
  }

  const ring = new THREE.Group();
  ring.add(
    layer(glowGeometry(LOGO.outer, LOGO.outerStroke, LOGO.glow), glowMat, 0.3, 2),
    ticks,
    layer(ringGeometry(LOGO.inner, LOGO.innerStroke), painted, 0.4, 4),
    layer(ringGeometry(LOGO.outer, LOGO.outerStroke), painted, 0.4, 4),
  );

  const needle = new THREE.Group();
  needle.add(
    layer(needleGeometry(1, NORTH_STOPS), painted, 0.6, 5),
    layer(needleGeometry(-1, SOUTH_STOPS), painted, 0.6, 5),
    layer(needleOutline(1), northEdge, 0.62, 5),
    layer(needleOutline(-1), southEdge, 0.62, 5),
    layer(new THREE.CircleGeometry(LOGO.dot, 64), dotMat, 0.7, 6),
    layer(new THREE.RingGeometry(LOGO.dot - LOGO.dotStroke / 2, LOGO.dot + LOGO.dotStroke / 2, 64), dotRingMat, 0.75, 7),
  );

  const disc = layer(discGeometry(LOGO.disc), discMat, 0.2, 1);
  const logo = new THREE.Group();
  logo.add(disc, ring, needle);
  logo.scale.setScalar(SCALE);
  // Logo-Ebene (x/y) flach auf den Boden legen: Norden zeigt von oben gesehen nach oben
  logo.rotation.x = -Math.PI / 2;
  const group = new THREE.Group();
  group.add(logo);
  // Etwas über dem Boden: im Finale liegen Straßen, Spur und flache Häuser sauber unter der Logo-Scheibe
  group.position.y = LIFT;
  group.traverse((o) => o.layers.set(LOGO_LAYER));

  const mats = [painted, glowMat, discMat, tickMat, dotMat, dotRingMat, northEdge, southEdge];

  return {
    group,
    set: (k, spread, spin) => {
      group.visible = k > 0.002;
      ring.scale.setScalar(1 + spread * 0.6);
      needle.rotation.z = -Math.PI / 4 - spin;
      needle.scale.setScalar(1 - spread * 0.4);
      painted.opacity = k;
      glowMat.opacity = k;
      tickMat.opacity = k * LOGO.tickOpacity;
      dotMat.opacity = k;
      dotRingMat.opacity = k;
      northEdge.opacity = k;
      southEdge.opacity = k;
      discMat.opacity = k * (1 - spread);
    },
    dispose: () => {
      group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}
