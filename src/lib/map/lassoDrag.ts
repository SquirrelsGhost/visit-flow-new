import type { Map as MapboxMap, Marker } from "mapbox-gl";
import type { LngLat } from "./lassoGeometry";

interface DragHandlers {
  onStart?: () => void;
  onDrag: (at: LngLat) => void;
  onEnd: (at: LngLat) => void;
  onTap: () => void;
}

/** Ab wie vielen Pixeln ein Antippen zum Ziehen wird (Finger zittern etwas). */
const DRAG_THRESHOLD_PX = 4;

/**
 * Ziehen eines Lasso-Griffs mit Pointer Events: gleich für Finger, Maus und Stift.
 * Der Griff bleibt dort, wo man ihn angefasst hat (kein Springen zur Fingermitte), die Karte steht still.
 */
export function attachDrag(map: MapboxMap, el: HTMLElement, marker: Marker, h: DragHandlers): () => void {
  let pointerId: number | null = null;
  let start = { x: 0, y: 0 };
  let grab = { x: 0, y: 0 };
  let moved = false;

  const local = (e: PointerEvent) => {
    const rect = map.getCanvas().getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const at = (e: PointerEvent): LngLat => {
    const p = local(e);
    const ll = map.unproject([p.x - grab.x, p.y - grab.y]);
    return [ll.lng, ll.lat];
  };

  const down = (e: PointerEvent) => {
    if (pointerId !== null || e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    pointerId = e.pointerId;
    el.setPointerCapture?.(e.pointerId);
    start = local(e);
    const pos = map.project(marker.getLngLat());
    grab = { x: start.x - pos.x, y: start.y - pos.y };
    moved = false;
    map.dragPan.disable();
  };
  const move = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    e.preventDefault();
    const p = local(e);
    if (!moved && Math.hypot(p.x - start.x, p.y - start.y) < DRAG_THRESHOLD_PX) return;
    if (!moved) {
      moved = true;
      h.onStart?.();
    }
    const to = at(e);
    marker.setLngLat(to);
    h.onDrag(to);
  };
  const up = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    el.releasePointerCapture?.(e.pointerId);
    map.dragPan.enable();
    if (moved) h.onEnd(at(e));
    else h.onTap();
  };
  // Mapbox soll den Griff nicht als Karten-Ziehen oder Klick sehen
  const swallow = (e: Event) => e.stopPropagation();

  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  for (const type of ["mousedown", "touchstart", "click", "dblclick"]) el.addEventListener(type, swallow);
  return () => {
    if (pointerId !== null) map.dragPan.enable();
  };
}
