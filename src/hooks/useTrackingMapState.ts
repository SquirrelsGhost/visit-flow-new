import type { Map as MapboxMap, MapMouseEvent, Marker } from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { reverseGeocodePoint } from "../lib/map/mapGeocoding";
import { checkPolygonsOverlap, evaluateGeofence, getAreaBounds } from "../lib/map/mapGeometry";
import { syncMapOverlays } from "../lib/map/mapLayers";
import { fitToHouses, updateMapCursor } from "../lib/map/mapCamera";
import { TEAM_HOUSES_LAYER } from "../lib/map/mapTeamLayer";
import {
  fetchMapAreasFromServer,
  fetchMapTeamMembers,
  readStoredAreas,
  saveAreaToServer,
  writeStoredAreas,
} from "../lib/map/mapStorage";
import {
  type DraftHouse,
  type GeofenceState,
  type MapArea,
  type TeamMemberOption,
  type VisitDetails,
  type VisitStatus,
} from "../lib/map/mapTypes";
import type { Theme } from "../lib/theme/themeContext";
import type { SaleResult } from "../lib/map/saleProducts";
import { useLassoEditor } from "./useLassoEditor";
import { useMapHouses } from "./useMapHouses";

export function useTrackingMapState(
  map: MapboxMap | null,
  theme: Theme,
  currentUserId: string | undefined,
  onStopFollow: () => void,
) {
  const houseStore = useMapHouses();
  const { houses } = houseStore;
  const [areas, setAreas] = useState<MapArea[]>(() => readStoredAreas());
  const [members, setMembers] = useState<TeamMemberOption[]>([]);
  const [selectedArea, setSelectedArea] = useState<MapArea | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftHouse | null>(null);
  const [creating, setCreating] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [isLassoMode, setIsLassoMode] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberOption | null>(null);
  const [geofence, setGeofence] = useState<GeofenceState>({ status: "unknown" });
  const [dismissedStatus, setDismissedStatus] = useState<string | null>(null);

  const isLassoRef = useRef(isLassoMode);
  const housesRef = useRef(houses);
  const areasRef = useRef(areas);
  const is3DRef = useRef(is3D);
  const themeRef = useRef(theme);
  const draftMarkerRef = useRef<Marker | null>(null);
  const lasso = useLassoEditor(map, isLassoMode);
  const lassoTapRef = useRef(lasso.tapMap);
  const hasPositionRef = useRef(false);
  const didFitRef = useRef(false);

  useEffect(() => {
    isLassoRef.current = isLassoMode;
    housesRef.current = houses;
    areasRef.current = areas;
    is3DRef.current = is3D;
    themeRef.current = theme;
    lassoTapRef.current = lasso.tapMap;
  }, [isLassoMode, houses, areas, is3D, theme, lasso.tapMap]);

  useEffect(() => {
    void fetchMapAreasFromServer().then((list) => {
      setAreas(list);
      writeStoredAreas(list);
    });
    void fetchMapTeamMembers().then(setMembers);
  }, []);

  useEffect(() => {
    if (!map) return;
    const apply = () => syncMapOverlays(map, housesRef.current, areasRef.current, currentUserId, is3DRef.current, themeRef.current);
    apply();
    map.on("style.load", apply);
    return () => {
      map.off("style.load", apply);
    };
  }, [map, houses, areas, currentUserId, is3D, theme]);

  // Einmalig auf die eigenen Häuser zoomen, solange noch kein Standort da ist (v1)
  useEffect(() => {
    if (!map || didFitRef.current || hasPositionRef.current || houses.length === 0) return;
    didFitRef.current = fitToHouses(map, houses);
  }, [map, houses]);

  useEffect(() => {
    if (!map) return;
    const onMove = (e: MapMouseEvent) => updateMapCursor(map, e.point);
    map.on("mousemove", onMove);
    return () => {
      map.off("mousemove", onMove);
    };
  }, [map]);

  useEffect(() => {
    draftMarkerRef.current?.remove();
    draftMarkerRef.current = null;
    if (!map || !draft) return;
    let cancelled = false;
    void import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (cancelled || !map) return;
      draftMarkerRef.current = new mapboxgl.Marker({ color: "#e2001a" }).setLngLat([draft.lng, draft.lat]).addTo(map);
      map.easeTo({ center: [draft.lng, draft.lat], duration: 300, offset: [0, -140] });
    });
    return () => {
      cancelled = true;
      draftMarkerRef.current?.remove();
      draftMarkerRef.current = null;
    };
  }, [map, draft]);

  useEffect(() => {
    if (!map) return;
    const handleClick = (e: MapMouseEvent) => {
      if (isLassoRef.current) {
        lassoTapRef.current([e.lngLat.lng, e.lngLat.lat]);
        return;
      }
      const hits = map.getLayer("houses-circle") ? map.queryRenderedFeatures(e.point, { layers: ["houses-circle"] }) : [];
      const firstHit = hits[0] as { properties?: { houseId?: string } } | undefined;
      const hitId = firstHit?.properties?.houseId;
      if (hitId) {
        setDraft(null);
        setSelectedTeamId(null);
        setSelectedHouseId(hitId);
        map.easeTo({ center: e.lngLat, duration: 300, offset: [0, -120] });
        return;
      }
      const teamHits = map.getLayer(TEAM_HOUSES_LAYER) ? map.queryRenderedFeatures(e.point, { layers: [TEAM_HOUSES_LAYER] }) : [];
      const teamId = (teamHits[0] as { properties?: { teamId?: string } } | undefined)?.properties?.teamId;
      if (teamId) {
        setDraft(null);
        setSelectedHouseId(null);
        setSelectedTeamId(teamId);
        map.easeTo({ center: e.lngLat, duration: 300, offset: [0, -100] });
        return;
      }
      setSelectedHouseId(null);
      setSelectedTeamId(null);
      setCreating(true);
      setDraft({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        street: "",
        houseNumber: "",
        zipCode: "",
        city: "",
        type: "EFH",
        doorName: "",
      });
      void reverseGeocodePoint(e.lngLat.lng, e.lngLat.lat).then((addr) => {
        setCreating(false);
        // Nur leere Felder füllen und nur beim selben Marker: schon Getipptes bleibt stehen
        setDraft((cur) =>
          cur && cur.lng === e.lngLat.lng && cur.lat === e.lngLat.lat
            ? {
                ...cur,
                street: cur.street || addr.street,
                houseNumber: cur.houseNumber || addr.houseNumber,
                zipCode: cur.zipCode || addr.zipCode,
                city: cur.city || addr.city,
              }
            : cur,
        );
      });
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map]);

  const handlePositionUpdate = useCallback(
    (lng: number, lat: number) => {
      hasPositionRef.current = true;
      setGeofence(evaluateGeofence(lng, lat, areasRef.current, currentUserId));
    },
    [currentUserId],
  );

  const toggle3D = useCallback(() => {
    setIs3D((cur) => {
      const next = !cur;
      map?.easeTo({ pitch: next ? 60 : 0, duration: 500 });
      return next;
    });
  }, [map]);

  const { reset: resetLasso } = lasso;
  const toggleLasso = useCallback(() => {
    const next = !isLassoMode;
    setIsLassoMode(next);
    if (!next) {
      resetLasso([]);
      setSelectedMember(null);
    } else {
      const ring = selectedArea?.geojson.coordinates[0] ?? [];
      resetLasso(ring.slice(0, Math.max(0, ring.length - 1)));
    }
  }, [isLassoMode, selectedArea, resetLasso]);

  const selectArea = useCallback(
    (area: MapArea | null) => {
      setSelectedArea(area);
      onStopFollow();
      if (!map) return;
      if (!area) {
        map.flyTo({ zoom: 12, duration: 900 });
        return;
      }
      const bounds = getAreaBounds(area);
      if (bounds) map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 1000 });
    },
    [map, onStopFollow],
  );

  const flyToAddress = useCallback(
    (lng: number, lat: number) => {
      onStopFollow();
      map?.flyTo({ center: [lng, lat], zoom: 18, duration: 1000, essential: true });
    },
    [map, onStopFollow],
  );

  const createHouseFromDraft = useCallback(
    (status: VisitStatus, comment: string, details?: VisitDetails, sale?: SaleResult) => {
      if (!draft) return;
      void houseStore.createFromDraft(draft, status, comment, details, sale);
      setDraft(null);
    },
    [draft, houseStore],
  );

  const updateHouseStatus = useCallback(
    (houseId: string, status: VisitStatus, unit: string | null, comment: string) => {
      houseStore.updateStatus(houseId, status, unit, comment);
      // MFH: Sheet bleibt offen, damit man weitere Parteien schnell nachsetzt (v1)
      if (!unit) setSelectedHouseId(null);
    },
    [houseStore],
  );

  const lassoPoints = lasso.points;
  const saveLassoArea = useCallback(async () => {
    if (lassoPoints.length < 3 || !selectedMember) return;
    const coords: [number, number][][] = [[...lassoPoints, lassoPoints[0]!]];
    const overlap = areas.find(
      (a) => (!selectedArea || a.id !== selectedArea.id) && checkPolygonsOverlap(coords, a.geojson.coordinates),
    );
    if (overlap) {
      toast.warning(`⚠️ Gebiets-Konflikt! Überschneidung mit "${overlap.name}".`);
    }
    const isEditing = Boolean(selectedArea);
    const area: MapArea = {
      id: selectedArea?.id ?? `area-${Date.now()}`,
      name: `Revier - ${selectedMember.name}`,
      description: `Über Tracking-Karte zugewiesen an ${selectedMember.name}`,
      managerId: selectedMember.id,
      managerName: selectedMember.name,
      geojson: { type: "Polygon", coordinates: coords },
    };
    await saveAreaToServer(area, isEditing);
    setAreas((prev) => {
      const next = isEditing ? prev.map((a) => (a.id === area.id ? area : a)) : [...prev, area];
      writeStoredAreas(next);
      return next;
    });
    toast.success(`Gebiet "${area.name}" gespeichert!`);
    setIsLassoMode(false);
    resetLasso([]);
    setSelectedMember(null);
  }, [lassoPoints, selectedMember, areas, selectedArea, resetLasso]);

  const selectedHouse = houses.find((h) => h.id === selectedHouseId) ?? null;

  return {
    houses,
    areas,
    members,
    selectedArea,
    selectedHouse,
    selectedTeamId,
    draft,
    creating,
    is3D,
    isLassoMode,
    lasso,
    selectedMember,
    geofence,
    dismissedStatus,
    setDraft,
    setSelectedHouseId,
    setSelectedTeamId,
    setSelectedMember,
    setDismissedStatus,
    handlePositionUpdate,
    toggle3D,
    toggleLasso,
    selectArea,
    flyToAddress,
    createHouseFromDraft,
    updateHouseStatus,
    saveFamilyName: houseStore.saveFamilyName,
    fixHouseNumber: houseStore.fixHouseNumber,
    saving: houseStore.saving,
    saveLassoArea,
  };
}
