import { ClipboardList, Network, Sparkles } from "lucide-react";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import GlassChip from "../glass/GlassChip";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

interface BackofficeAddonProps {
  admin: boolean;
}

/** Add-on-Stand und Wege zu den verwandten Seiten; Admins können sich das Angebot der Teamleiter ansehen. */
export default function BackofficeAddon({ admin }: BackofficeAddonProps) {
  return (
    <GlassSection label={t.addon}>
      <GlassRow icon={Sparkles} tone="amber" title={t.addonActive} subtitle={admin ? t.addonAdmin : undefined} trailing={<GlassChip tone="green">{t.addonActiveChip}</GlassChip>} />
      {admin && <GlassRow icon={Sparkles} tone="purple" title={t.teaserPreview} subtitle={t.teaserPreviewHint} href="/team-backoffice?angebot=1" />}
      <GlassRow icon={Network} tone="red" title={t.myTeams} href="/teams" />
      <GlassRow icon={ClipboardList} tone="blue" title={t.orders} href="/crm" />
    </GlassSection>
  );
}
