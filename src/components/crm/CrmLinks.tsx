import { Calculator, ReceiptText, User } from "lucide-react";
import type { Vertical } from "../../lib/battle/battleCategories";
import { crmTexts as t } from "../../texts/crmTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

const LINKS = { abrechnung: "/abrechnung", simulator: "/provisions-simulator", profile: "/profile" } as const;

/** Wohin die Aufträge wirken: Abrechnung (Stornos reklamieren), Simulator (Bonus) und Profil (Vertragsmonat). */
export interface CrmLinksProps { vertical: Vertical }

export default function CrmLinks({ vertical }: CrmLinksProps) {
  return (
    <GlassSection label={t.links}>
      <GlassRow icon={ReceiptText} tone="orange" title={t.toAbrechnung} subtitle={t.toAbrechnungText} href={LINKS.abrechnung} />
      <GlassRow icon={Calculator} tone="green" title={t.toSimulator} subtitle={vertical === "telco" ? t.toSimulatorText : t.toSimulatorOther} href={LINKS.simulator} />
      <GlassRow icon={User} tone="blue" title={t.toProfile} subtitle={t.toProfileText} href={LINKS.profile} />
    </GlassSection>
  );
}
