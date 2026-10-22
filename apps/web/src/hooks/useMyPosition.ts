import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createMeMarkerElement } from "../lib/map/meMarker";
import { MY_POSITION_ZOOM } from "../lib/map/mapStyles";

/**
 * Eigener Standort auf der Karte (v1: watchPosition + Me-Marker). Beim ersten Fix fliegt die Karte hin.
 * Solange "folgen" an ist, bleibt die Karte beim Standort; Verschieben von Hand schaltet es aus.
 */
export function useMyPosition(map: MapboxMap | null) {
  const marker = useRef<Marker | null>(null);
  const [follow, setFollow] = useState(true);
  const followRef = useRef(follow);

  useEffect(() => {
    followRef.current = follow;
  }, [follow]);

  useEffect(() => {
    if (!map || !("geolocation" in navigator)) return;
    let cancelled = false;
    let first = true;
    const stopFollow = (event: { originalEvent?: unknown }) => event.originalEvent && setFollow(false);
    map.on("dragstart", stopFollow);

    const watchId = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const lngLat: [number, number] = [coords.longitude, coords.latitude];
        if (!marker.current) {
          const { default: mapboxgl } = await import("mapbox-gl");
          if (cancelled) return;
          marker.current = new mapboxgl.Marker({ element: createMeMarkerElement() }).setLngLat(lngLat).addTo(map);
        }
        marker.current.setLngLat(lngLat);
        if (first || followRef.current) {
          map.flyTo({ center: lngLat, zoom: first ? MY_POSITION_ZOOM : map.getZoom(), duration: first ? 1800 : 700, essential: true });
          first = false;
        }
      },
      (error) => console.warn("Standort nicht verfügbar:", error.message),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
      map.off("dragstart", stopFollow);
      marker.current?.remove();
      marker.current = null;
    };
  }, [map]);

  /** Standort-Knopf: zurück zum eigenen Standort und wieder folgen. */
  const locate = useCallback(() => {
    setFollow(true);
    const position = marker.current?.getLngLat();
    if (map && position) map.flyTo({ center: position, zoom: MY_POSITION_ZOOM, duration: 700, essential: true });
  }, [map]);

  return { follow, locate };
}
