import type { Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef } from "react";
import { simplifyPath, type LngLat } from "../lib/map/lassoGeometry";

interface FreehandOptions {
  enabled: boolean;
  preview: (temp: LngLat[]) => void;
  guardClick: () => void;
  /** Zeigt wieder den gespeicherten Stand, wenn die Linie zu kurz war. */
  restore: () => void;
  onDone: (points: LngLat[]) => void;
}

/** Wie stark die Freihand-Linie geglättet wird: kleiner = mehr Punkte. */
const TOLERANCE_PX = 11;
const MIN_STEP_PX = 3;

/**
 * Freihand-Lasso: mit Finger oder Maus um die Straßen fahren, beim Loslassen wird daraus ein Revier
 * mit wenigen, gut greifbaren Eckpunkten. Die Karte bewegt sich dabei nicht mit.
 */
export function useLassoFreehand(map: MapboxMap | null, options: FreehandOptions) {
  const optsRef = useRef(options);
  useEffect(() => {
    optsRef.current = options;
  });
  const { enabled } = options;

  useEffect(() => {
    if (!map || !enabled) return;
    const container = map.getCanvasContainer();
    const canvas = map.getCanvas();
    let path: { x: number; y: number }[] = [];
    let pointerId: number | null = null;

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const toLngLat = (p: { x: number; y: number }): LngLat => {
      const ll = map.unproject([p.x, p.y]);
      return [ll.lng, ll.lat];
    };

    const down = (e: PointerEvent) => {
      if (pointerId !== null || e.button > 0) return;
      pointerId = e.pointerId;
      container.setPointerCapture?.(e.pointerId);
      path = [local(e)];
      e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const p = local(e);
      const last = path[path.length - 1]!;
      if (Math.hypot(p.x - last.x, p.y - last.y) < MIN_STEP_PX) return;
      path.push(p);
      optsRef.current.preview(path.map(toLngLat));
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      optsRef.current.guardClick();
      let simple = simplifyPath(path, TOLERANCE_PX);
      // Endet die Linie fast am Anfang, ist das dieselbe Ecke
      const [first, last] = [simple[0], simple[simple.length - 1]];
      if (first && last && simple.length > 3 && Math.hypot(first.x - last.x, first.y - last.y) < 24) simple = simple.slice(0, -1);
      path = [];
      if (simple.length >= 3) optsRef.current.onDone(simple.map(toLngLat));
      else optsRef.current.restore();
    };

    map.dragPan.disable();
    container.style.touchAction = "none";
    container.style.cursor = "crosshair";
    container.addEventListener("pointerdown", down);
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerup", up);
    container.addEventListener("pointercancel", up);
    return () => {
      container.removeEventListener("pointerdown", down);
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerup", up);
      container.removeEventListener("pointercancel", up);
      container.style.touchAction = "";
      container.style.cursor = "";
      map.dragPan.enable();
    };
  }, [map, enabled]);
}
