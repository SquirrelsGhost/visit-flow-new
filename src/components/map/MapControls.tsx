import { Box, Layers, LocateFixed, Pencil } from "lucide-react";
import { motion } from "motion/react";
import type { MapStyleKey } from "../../lib/map/mapStyles";
import { mapTexts } from "../../texts/appTexts";
import MapControlButton from "./MapControlButton";

interface MapControlsProps {
  styleKey: MapStyleKey;
  onToggleStyle: () => void;
  following: boolean;
  onLocate: () => void;
  isLassoMode: boolean;
  onToggleLasso: () => void;
  is3D: boolean;
  onToggle3D: () => void;
}

/** Kartenknöpfe rechts unten (v1): Lasso, Satellit/Karte, 3D/2D und eigener Standort. */
export default function MapControls({
  styleKey,
  onToggleStyle,
  following,
  onLocate,
  isLassoMode,
  onToggleLasso,
  is3D,
  onToggle3D,
}: MapControlsProps) {
  return (
    <motion.div
      className="absolute bottom-4 right-3 z-10 flex flex-col gap-2"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }}
    >
      <MapControlButton
        label="Lasso-Zeichnung umschalten"
        caption={isLassoMode ? "Aktiv" : "Lasso"}
        tone={isLassoMode ? "purple" : "glass"}
        onClick={onToggleLasso}
      >
        <Pencil size={18} />
      </MapControlButton>
      <MapControlButton
        label={mapTexts.switchStyle}
        caption={styleKey === "satellite" ? mapTexts.streets : mapTexts.satellite}
        onClick={onToggleStyle}
      >
        <Layers size={18} />
      </MapControlButton>
      <MapControlButton
        label="3D-Ansicht umschalten"
        caption={is3D ? "2D" : "3D"}
        tone={is3D ? "active" : "glass"}
        onClick={onToggle3D}
      >
        <Box size={18} />
      </MapControlButton>
      <MapControlButton
        label={following ? mapTexts.following : mapTexts.locate}
        tone={following ? "active" : "brand"}
        onClick={onLocate}
      >
        <LocateFixed size={20} />
      </MapControlButton>
    </motion.div>
  );
}
