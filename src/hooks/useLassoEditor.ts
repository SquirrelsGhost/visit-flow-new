import type { Map as MapboxMap, MapMouseEvent } from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticFeedback } from "../lib/device/haptics";
import type { LngLat } from "../lib/map/lassoGeometry";
import { commit, emptyHistory, insertPoint, movePoint, redo, removePoint, undo } from "../lib/map/lassoHistory";
import { syncLassoGuide, syncLassoOverlay } from "../lib/map/lassoLayer";
import { useLassoFreehand } from "./useLassoFreehand";
import { useLassoHandles } from "./useLassoHandles";

/** Nach Ziehen oder Antippen eines Griffs kommt noch ein Karten-Klick: der soll keinen Punkt setzen. */
const CLICK_GUARD_MS = 400;

/**
 * Lasso-Revierplaner: Punkte setzen, ziehen (Finger und Maus), Zwischenpunkte einfügen, löschen,
 * Freihand zeichnen, Rückgängig/Wiederholen. v1 konnte ziehen und per Doppelklick löschen; das bleibt.
 */
export function useLassoEditor(map: MapboxMap | null, active: boolean) {
  const [history, setHistory] = useState(() => emptyHistory());
  const [selected, setSelected] = useState<number | null>(null);
  const [freehand, setFreehand] = useState(false);
  const points = history.present;
  const pointsRef = useRef(points);
  const guardUntilRef = useRef(0);

  const change = useCallback((next: (cur: LngLat[]) => LngLat[]) => {
    setHistory((h) => commit(h, next(h.present)));
    setSelected(null);
  }, []);

  const guardClick = useCallback(() => {
    guardUntilRef.current = Date.now() + CLICK_GUARD_MS;
  }, []);

  /** Für den Karten-Klick: Punkt hinzufügen, außer der Klick gehört noch zu einem Griff. */
  const tapMap = useCallback(
    (at: LngLat) => {
      if (Date.now() < guardUntilRef.current) return;
      change((cur) => [...cur, at]);
      hapticFeedback("light");
    },
    [change],
  );

  const reset = useCallback((next: LngLat[]) => {
    setHistory(emptyHistory(next));
    setSelected(null);
    setFreehand(false);
  }, []);

  const preview = useCallback((temp: LngLat[]) => syncLassoOverlay(map, temp), [map]);

  // Karte zeigt immer den gespeicherten Stand, auch nach einem Wechsel Satellit/Karte
  useEffect(() => {
    pointsRef.current = points;
    if (!map) return;
    const draw = () => syncLassoOverlay(map, active ? pointsRef.current : []);
    draw();
    map.on("style.load", draw);
    return () => {
      map.off("style.load", draw);
    };
  }, [map, points, active]);

  // Doppeltipp setzt im Lasso zwei Punkte statt zu zoomen
  useEffect(() => {
    if (!map || !active) return;
    map.doubleClickZoom.disable();
    return () => {
      map.doubleClickZoom.enable();
    };
  }, [map, active]);

  // Gestrichelte Vorschau zum Mauszeiger (nur Maus; am Handy gibt es keinen Zeiger)
  useEffect(() => {
    if (!map || !active || freehand) return;
    const onMove = (e: MapMouseEvent) => syncLassoGuide(map, pointsRef.current, [e.lngLat.lng, e.lngLat.lat]);
    const onOut = () => syncLassoGuide(map, pointsRef.current, null);
    map.on("mousemove", onMove);
    map.on("mouseout", onOut);
    return () => {
      map.off("mousemove", onMove);
      map.off("mouseout", onOut);
      syncLassoGuide(map, pointsRef.current, null);
    };
  }, [map, active, freehand]);

  const doUndo = useCallback(() => {
    setHistory(undo);
    setSelected(null);
  }, []);
  const doRedo = useCallback(() => {
    setHistory(redo);
    setSelected(null);
  }, []);
  const removeAt = useCallback((i: number) => change((cur) => removePoint(cur, i)), [change]);

  // Strg/Cmd+Z, Strg+Umschalt+Z bzw. Strg+Y, Entf für den gewählten Punkt
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") (e.shiftKey ? doRedo : doUndo)();
      else if (mod && e.key.toLowerCase() === "y") doRedo();
      else if ((e.key === "Delete" || e.key === "Backspace") && selected !== null) removeAt(selected);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, selected, doUndo, doRedo, removeAt]);

  useLassoHandles(map, {
    enabled: active && !freehand,
    points,
    selected,
    preview,
    guardClick,
    onSelect: setSelected,
    onMove: (i, to) => change((cur) => movePoint(cur, i, to)),
    onInsert: (i, at) => change((cur) => insertPoint(cur, i, at)),
    onRemove: removeAt,
  });

  useLassoFreehand(map, {
    enabled: active && freehand,
    preview,
    guardClick,
    restore: () => preview(pointsRef.current),
    onDone: (drawn) => {
      change(() => drawn);
      setFreehand(false);
      hapticFeedback("medium");
    },
  });

  return {
    points,
    selected,
    freehand,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    tapMap,
    reset,
    setFreehand,
    undo: doUndo,
    redo: doRedo,
    clear: () => change(() => []),
    removeSelected: () => selected !== null && removeAt(selected),
  };
}
