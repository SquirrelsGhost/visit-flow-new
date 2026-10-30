import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { useEffect, useRef } from "react";
import { hapticFeedback } from "../lib/device/haptics";
import { attachDrag } from "../lib/map/lassoDrag";
import { edgeMidpoints, type LngLat } from "../lib/map/lassoGeometry";
import { insertPoint, movePoint } from "../lib/map/lassoHistory";
import { createLassoMidpoint, createLassoVertex } from "../lib/map/lassoMarkers";

interface LassoHandleOptions {
  enabled: boolean;
  points: LngLat[];
  selected: number | null;
  /** Zeichnet einen Zwischenstand, ohne React neu zu rendern (flüssig beim Ziehen). */
  preview: (temp: LngLat[]) => void;
  guardClick: () => void;
  onSelect: (index: number | null) => void;
  onMove: (index: number, to: LngLat) => void;
  onInsert: (afterIndex: number, at: LngLat) => void;
  onRemove: (index: number) => void;
}

const DOUBLE_TAP_MS = 350;
const MIN_EDGE_PX = 56;

/**
 * Ziehbare Griffe für das Lasso: Eckpunkte (ziehen, antippen = wählen, Doppeltipp = löschen wie v1) und
 * Zwischenpunkte auf den Kanten (antippen oder herausziehen = neuer Punkt).
 */
export function useLassoHandles(map: MapboxMap | null, options: LassoHandleOptions) {
  const optsRef = useRef(options);
  // Doppeltipp über das Neuzeichnen der Griffe hinweg erkennen (erster Tipp wählt den Punkt aus)
  const lastTapRef = useRef({ index: -1, at: 0 });
  useEffect(() => {
    optsRef.current = options;
  });
  const { enabled, points, selected } = options;

  useEffect(() => {
    if (!map || !enabled || points.length === 0) return;
    const markers: Marker[] = [];
    const detach: (() => void)[] = [];
    const container = map.getContainer();
    const o = () => optsRef.current;
    let cancelled = false;

    const dragging = (on: boolean) => {
      container.dataset.lassoDragging = on ? "true" : "false";
      o().guardClick();
    };

    void import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (cancelled) return;
      const add = (el: HTMLElement, pt: LngLat) => {
        const marker = new mapboxgl.Marker({ element: el }).setLngLat(pt).addTo(map);
        markers.push(marker);
        return marker;
      };

      edgeMidpoints(points).forEach((pt, i) => {
        // Auf kurzen Kanten wäre das "+" im Weg: erst ab genug Abstand zwischen den Eckpunkten zeigen
        const [a, b] = [map.project(points[i]!), map.project(points[(i + 1) % points.length]!)];
        if (Math.hypot(a.x - b.x, a.y - b.y) < MIN_EDGE_PX) return;
        const el = createLassoMidpoint(i);
        const marker = add(el, pt);
        detach.push(
          attachDrag(map, el, marker, {
            onStart: () => dragging(true),
            onDrag: (to) => o().preview(insertPoint(points, i, to)),
            onEnd: (to) => {
              dragging(false);
              o().onInsert(i, to);
              hapticFeedback("medium");
            },
            onTap: () => {
              o().guardClick();
              o().onInsert(i, pt);
              hapticFeedback("light");
            },
          }),
        );
      });

      points.forEach((pt, i) => {
        const el = createLassoVertex(i, selected === i, i === 0 && points.length > 2);
        const marker = add(el, pt);
        detach.push(
          attachDrag(map, el, marker, {
            onStart: () => {
              el.classList.add("is-dragging");
              dragging(true);
              hapticFeedback("light");
            },
            onDrag: (to) => o().preview(movePoint(points, i, to)),
            onEnd: (to) => {
              el.classList.remove("is-dragging");
              dragging(false);
              o().onMove(i, to);
              hapticFeedback("medium");
            },
            onTap: () => {
              o().guardClick();
              const now = Date.now();
              const last = lastTapRef.current;
              lastTapRef.current = { index: i, at: now };
              if (last.index === i && now - last.at < DOUBLE_TAP_MS) {
                lastTapRef.current = { index: -1, at: 0 };
                o().onRemove(i);
                hapticFeedback("medium");
              } else {
                o().onSelect(selected === i ? null : i);
              }
            },
          }),
        );
      });
    });

    return () => {
      cancelled = true;
      container.dataset.lassoDragging = "false";
      for (const d of detach) d();
      for (const m of markers) m.remove();
    };
  }, [map, enabled, points, selected]);
}
