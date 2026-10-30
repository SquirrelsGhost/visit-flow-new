// Mapbox braucht den Browser (Canvas, WebGL, Standort)
"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useMapbox } from "../../hooks/useMapbox";
import { useMyPosition } from "../../hooks/useMyPosition";
import { useTeamMapLayer } from "../../hooks/useTeamMapLayer";
import { useTheme } from "../../hooks/useTheme";
import { useTrackingMapState } from "../../hooks/useTrackingMapState";
import { useVertical } from "../../hooks/useVertical";
import { lassoStats } from "../../lib/map/lassoStats";
import type { MapStyleKey } from "../../lib/map/mapStyles";
import MapControls from "./MapControls";
import MapDraftSheet from "./MapDraftSheet";
import MapGeofenceBanner from "./MapGeofenceBanner";
import MapHouseSheet from "./MapHouseSheet";
import MapLassoPanel from "./MapLassoPanel";
import MapLegend from "./MapLegend";
import MapNotice from "./MapNotice";
import MapTeamHouseSheet from "./MapTeamHouseSheet";
import MapTopBar from "./MapTopBar";

/**
 * Vollständige Tracking-Karte aus v1 (TrackingMap): Satellit/Karte, 3D-Gebäude, Lasso-Gebietsplaner,
 * Adresssuche mit Vorschlägen, Status-Legende und 2-Tap-Hauserfassung (EFH & MFH).
 */
export interface MapViewProps { readonly _?: never; }

export default function MapView() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { user } = useAuth();
  const vertical = useVertical();
  const [styleKey, setStyleKey] = useState<MapStyleKey>("satellite");
  const { map, failure } = useMapbox(container, styleKey, theme);

  const stopFollowRef = useRef<() => void>(() => {});
  const stopFollow = useCallback(() => stopFollowRef.current(), []);

  const tracking = useTrackingMapState(map, theme, user?.id, stopFollow);
  const { follow, setFollow, locate } = useMyPosition(map, tracking.handlePositionUpdate);
  const { teamHouses, teamCount } = useTeamMapLayer(map, user);
  const selectedTeamHouse = teamHouses.find((t) => t.id === tracking.selectedTeamId) ?? null;
  const lassoPoints = tracking.lasso.points;
  const stats = useMemo(
    () =>
      lassoStats(lassoPoints, [
        ...tracking.houses.map((h) => [h.longitude, h.latitude] as [number, number]),
        ...teamHouses.map((t) => [t.lng, t.lat] as [number, number]),
      ]),
    [lassoPoints, tracking.houses, teamHouses],
  );

  useEffect(() => {
    stopFollowRef.current = () => setFollow(false);
  }, [setFollow]);

  const getMapCenter = useCallback(() => {
    if (!map) return null;
    const c = map.getCenter();
    return { lng: c.lng, lat: c.lat };
  }, [map]);

  return (
    // isolate: Sheets und Overlays bleiben unter der Navigation, der rote Home-Knopf liegt immer obenauf
    <div className="relative isolate h-full w-full overflow-hidden bg-slate-200 dark:bg-slate-900" data-testid="map-view">
      <div ref={container} className="vf-map-canvas absolute inset-0" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-background"
        initial={{ opacity: 1 }}
        animate={{ opacity: map ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {failure ? (
        <MapNotice failure={failure} />
      ) : (
        <>
          <MapTopBar
            areas={tracking.areas}
            selectedArea={tracking.selectedArea}
            onSelectArea={tracking.selectArea}
            onFlyToAddress={tracking.flyToAddress}
            getMapCenter={getMapCenter}
            teamCount={teamCount}
          />
          <MapGeofenceBanner
            geofence={tracking.geofence}
            dismissedStatus={tracking.dismissedStatus}
            onDismiss={tracking.setDismissedStatus}
          />
          <MapLassoPanel
            isOpen={tracking.isLassoMode}
            editingArea={tracking.selectedArea}
            lasso={tracking.lasso}
            stats={stats}
            members={tracking.members}
            selectedMember={tracking.selectedMember}
            onSelectMember={tracking.setSelectedMember}
            onSave={() => void tracking.saveLassoArea()}
            onClose={tracking.toggleLasso}
          />
          <MapLegend vertical={vertical} />
          <MapControls
            styleKey={styleKey}
            onToggleStyle={() => setStyleKey((current) => (current === "satellite" ? "map" : "satellite"))}
            following={follow}
            onLocate={locate}
            isLassoMode={tracking.isLassoMode}
            onToggleLasso={tracking.toggleLasso}
            is3D={tracking.is3D}
            onToggle3D={tracking.toggle3D}
          />
          <MapDraftSheet
            draft={tracking.draft}
            creating={tracking.creating}
            saving={tracking.saving}
            vertical={vertical}
            onChangeDraft={tracking.setDraft}
            onClose={() => tracking.setDraft(null)}
            onApplyStatus={tracking.createHouseFromDraft}
          />
          <MapHouseSheet
            house={tracking.selectedHouse}
            vertical={vertical}
            onClose={() => tracking.setSelectedHouseId(null)}
            onUpdateStatus={tracking.updateHouseStatus}
            onSaveFamilyName={tracking.saveFamilyName}
            onFixHouseNumber={tracking.fixHouseNumber}
          />
          <MapTeamHouseSheet
            house={selectedTeamHouse}
            vertical={vertical}
            onClose={() => tracking.setSelectedTeamId(null)}
          />
        </>
      )}
    </div>
  );
}
