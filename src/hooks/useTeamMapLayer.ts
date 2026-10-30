import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { hasDemoSession } from "../lib/auth/demoSession";
import { fetchTeamHouses, fetchTeamPositions, LEADER_ROLES, type TeamHouse } from "../lib/map/mapTeam";
import { syncTeamHousesLayer } from "../lib/map/mapTeamLayer";
import { createMateMarkerElement, createMatePopupContent } from "../lib/map/mateMarker";
import type { AuthUser } from "../shared/auth/authSchemas";

/** v2 hat noch keinen Socket: Team-Häuser jede Minute, Kollegen-Positionen alle 20 s neu holen. */
const HOUSES_POLL_MS = 60_000;
const POSITIONS_POLL_MS = 20_000;
/** Demo-Daten erst ab Straßen-Zoom um die Kartenmitte legen. */
const DEMO_MIN_ZOOM = 13;

function centerOf(map: MapboxMap): { lng: number; lat: number } | null {
  if (!hasDemoSession() || map.getZoom() < DEMO_MIN_ZOOM) return null;
  const c = map.getCenter();
  return { lng: c.lng, lat: c.lat };
}

/**
 * Team-Transparenz aus v1: Häuser der Kollegen als eigene Ebene und, für Leitungsrollen,
 * Live-Positionen der Kollegen als Pins. Liefert die Team-Häuser und den Team-Zähler.
 */
export function useTeamMapLayer(map: MapboxMap | null, user: AuthUser | null) {
  const [teamHouses, setTeamHouses] = useState<TeamHouse[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const housesRef = useRef(teamHouses);
  const markers = useRef<Record<string, Marker>>({});
  const userId = user?.id;
  const teamId = typeof user?.teamId === "string" ? user.teamId : undefined;
  const isLeader = Boolean(user && LEADER_ROLES.includes(user.role));

  useEffect(() => {
    housesRef.current = teamHouses;
    syncTeamHousesLayer(map, teamHouses);
  }, [map, teamHouses]);

  const loadHouses = useCallback(async () => {
    if (!map || !userId) return;
    const list = await fetchTeamHouses(userId, centerOf(map)).catch(() => null);
    if (list) setTeamHouses(list);
  }, [map, userId]);

  useEffect(() => {
    if (!map || !userId) return;
    const restyle = () => syncTeamHousesLayer(map, housesRef.current);
    // Demo-Häuser erscheinen, sobald die Karte auf Straßenebene zur Ruhe kommt
    const demoRetry = () => hasDemoSession() && housesRef.current.length === 0 && void loadHouses();
    const first = window.setTimeout(() => void loadHouses(), 0);
    const timer = window.setInterval(() => void loadHouses(), HOUSES_POLL_MS);
    map.on("style.load", restyle);
    map.on("idle", demoRetry);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      map.off("style.load", restyle);
      map.off("idle", demoRetry);
    };
  }, [map, userId, loadHouses]);

  useEffect(() => {
    const canSee = isLeader && (Boolean(teamId) || hasDemoSession());
    if (!map || !canSee) return;
    let active = true;
    const pins = markers.current;

    const loadPositions = async () => {
      const list = await fetchTeamPositions(teamId ?? "demo", userId, centerOf(map)).catch(() => null);
      if (!active || !list || list.length === 0) return;
      const { default: mapboxgl } = await import("mapbox-gl");
      if (!active) return;
      for (const pos of list) {
        const existing = pins[pos.userId];
        if (existing) {
          existing.setLngLat([pos.lng, pos.lat]);
          continue;
        }
        const popup = new mapboxgl.Popup({ offset: 16, closeButton: false }).setDOMContent(
          createMatePopupContent(pos.userId, pos.name),
        );
        pins[pos.userId] = new mapboxgl.Marker({ element: createMateMarkerElement(pos.userId, pos.name) })
          .setLngLat([pos.lng, pos.lat])
          .setPopup(popup)
          .addTo(map);
      }
      setTeamCount(Object.keys(pins).length);
    };

    void loadPositions();
    const timer = window.setInterval(() => void loadPositions(), POSITIONS_POLL_MS);
    const demoRetry = () => hasDemoSession() && Object.keys(pins).length === 0 && void loadPositions();
    map.on("idle", demoRetry);
    return () => {
      active = false;
      window.clearInterval(timer);
      map.off("idle", demoRetry);
      for (const marker of Object.values(pins)) marker.remove();
      markers.current = {};
      setTeamCount(0);
    };
  }, [map, isLeader, teamId, userId]);

  return { teamHouses, teamCount };
}
