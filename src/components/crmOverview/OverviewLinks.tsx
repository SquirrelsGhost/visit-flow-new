import { Clock, Database } from "lucide-react";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

/** v1 hatte hier zwei weitere Reiter; in v2 sind es eigene Seiten aus dem Admin-Menü. */
export interface OverviewLinksProps { readonly _?: never; }

export default function OverviewLinks() {
  return (
    <GlassSection label={t.links}>
      <GlassRow icon={Clock} tone="purple" title={t.expiring} subtitle={t.expiringHint} href="/expiring-contracts" />
      <GlassRow icon={Database} tone="green" title={t.integrations} subtitle={t.integrationsHint} href="/crm-integration" />
    </GlassSection>
  );
}
