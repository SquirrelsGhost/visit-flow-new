import { Layers, LocateFixed } from "lucide-react";
import { motion } from "motion/react";
import type { MapStyleKey } from "../../lib/map/mapStyles";
import { mapTexts } from "../../texts/appTexts";
import MapControlButton from "./MapControlButton";

interface MapControlsProps {
  styleKey: MapStyleKey;
  onToggleStyle: () => void;
  following: boolean;
  onLocate: () => void;
}

/** Kartenknöpfe rechts unten (v1): Satellit/Karte und eigener Standort. Gleiten nacheinander herein. */
export default function MapControls({ styleKey, onToggleStyle, following, onLocate }: MapControlsProps) {
  return (
    <motion.div
      className="absolute bottom-4 right-3 z-10 flex flex-col gap-2"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } } }}
    >
      <MapControlButton
        label={mapTexts.switchStyle}
        caption={styleKey === "satellite" ? mapTexts.streets : mapTexts.satellite}
        onClick={onToggleStyle}
      >
        <Layers size={18} />
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
