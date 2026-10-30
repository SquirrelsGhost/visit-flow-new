import { Eraser, FileDown } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";

interface AuditToolsProps {
  onExport: () => void;
  onCleanup: () => void;
}

/** Werkzeuge des Protokolls wie in v1: CSV-Export und alte Einträge bereinigen. */
export default function AuditTools({ onExport, onCleanup }: AuditToolsProps) {
  const t = useSecurityTexts().audit;
  return (
    <GlassSection>
      <GlassRow icon={FileDown} tone="blue" title={t.export} subtitle={t.exportHint} onClick={onExport} />
      <GlassRow icon={Eraser} tone="orange" title={t.cleanup} subtitle={t.cleanupHint} onClick={onCleanup} />
    </GlassSection>
  );
}
