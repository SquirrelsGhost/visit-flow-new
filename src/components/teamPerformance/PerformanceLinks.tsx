import { MapPinned, ReceiptText } from "lucide-react";
import { HOME_HREF } from "../../lib/navigation/navItems";
import { teamPerformanceTexts as texts } from "../../texts/teamPerformanceTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

interface PerformanceLinksProps {
  demo: boolean;
}

const ABRECHNUNG_HREF = "/abrechnung";

/** Wo die Zahlen entstehen (Karte) und wo sie abgerechnet werden (Abrechnung). */
export default function PerformanceLinks({ demo }: PerformanceLinksProps) {
  return (
    <GlassSection label={texts.connected} footer={demo ? texts.demoFooter : texts.footer}>
      <GlassRow icon={MapPinned} tone="red" title={texts.toMap} subtitle={texts.toMapText} href={HOME_HREF} />
      <GlassRow icon={ReceiptText} tone="green" title={texts.toAbrechnung} subtitle={texts.toAbrechnungText} href={ABRECHNUNG_HREF} />
    </GlassSection>
  );
}
