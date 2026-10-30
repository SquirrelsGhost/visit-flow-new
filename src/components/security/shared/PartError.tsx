import { RefreshCw } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import GlassRow from "../../glass/GlassRow";

interface PartErrorProps {
  onRetry: () => void;
}

/** Zeile in einer Karte, deren Daten nicht geladen werden konnten (der Rest der Seite bleibt sichtbar). */
export default function PartError({ onRetry }: PartErrorProps) {
  const t = useSecurityTexts();
  return <GlassRow icon={RefreshCw} tone="gray" title={t.partError} subtitle={t.retry} onClick={onRetry} />;
}
