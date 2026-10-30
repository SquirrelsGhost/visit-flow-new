import { ShieldCheck } from "lucide-react";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import type { ThreatEntity } from "../../../lib/security/securityThreatTypes";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";
import ThreatRow from "./ThreatRow";

interface ThreatsCardProps {
  threats: ThreatEntity[];
  /** Konto-Id → E-Mail aus Sitzungen und Geräten, damit statt der Id ein Name steht. */
  emails: Readonly<Record<string, string>>;
  onClear: (threat: ThreatEntity) => void;
}

/** Höchstens so viele IPs, damit die Spalte neben den Sitzungen ruhig bleibt; der Server liefert bis 100. */
const MAX = 8;

/** Verdächtige und gesperrte IPs des Kopierschutzes (v1 Anti-Copy Blockiert + Verdächtig) in einer Liste. */
export default function ThreatsCard({ threats, emails, onClear }: ThreatsCardProps) {
  const t = useSecurityTexts().threats;
  return (
    <GlassSection label={`${t.label} · ${threats.length}`} footer={t.footer}>
      {threats.length === 0 && <GlassRow icon={ShieldCheck} tone="green" title={t.empty} />}
      {threats.slice(0, MAX).map((x) => (
        <ThreatRow key={x.ip} threat={x} email={x.userId ? emails[x.userId] : undefined} onClear={onClear} />
      ))}
    </GlassSection>
  );
}
