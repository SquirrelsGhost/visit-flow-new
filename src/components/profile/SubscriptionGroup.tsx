import { BadgeCheck, Users, UserPlus, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { riseIn } from "../../lib/motion/presets";
import { canManageLicenses } from "../../lib/profile/profileRules";
import type { Subscription } from "../../lib/profile/profileTypes";
import { fill, profileTexts } from "../../texts/profileTexts";
import SettingsGroup from "../settings/SettingsGroup";
import SettingsRow from "../settings/SettingsRow";
import { GROUP_LABEL } from "../settings/settingsStyles";
import InvoicesDialog from "./InvoicesDialog";
import LicenseCard from "./LicenseCard";
import StatusPill from "./StatusPill";

interface SubscriptionGroupProps {
  role: string;
  teamName: string | undefined;
  subscription: Subscription | null | undefined;
}

const texts = profileTexts.subscription;
/** Ziel wie "Team-Lizenzierung" im Benutzermenü (v1 /subscription?licensing=true). */
const LICENSING_HREF = "/subscription?licensing=true";
const ADD_HREF = "/subscription?licensing=true&add=1";

/**
 * Lizenz und Abo. Teamleiter und Admin sehen die Team-Lizenzen und verwalten sie; Berater sehen nur,
 * dass ihre Lizenz über das Team läuft, ohne Abo-Verwaltung und Rechnungen.
 */
export default function SubscriptionGroup({ role, teamName, subscription }: SubscriptionGroupProps) {
  const [invoicesOpen, setInvoicesOpen] = useState(false);

  if (!canManageLicenses(role)) {
    return (
      <SettingsGroup label={profileTexts.groups.license} footer={texts.mineFooter}>
        <SettingsRow
          icon={BadgeCheck}
          tone="green"
          title={texts.mine}
          subtitle={fill(texts.mineVia, { team: teamName ?? profileTexts.noTeam })}
          trailing={subscription && <StatusPill status={subscription.status} />}
        />
      </SettingsGroup>
    );
  }

  return (
    <motion.section variants={riseIn} className="space-y-3">
      <h3 className={GROUP_LABEL}>{profileTexts.groups.subscription}</h3>
      <LicenseCard subscription={subscription} />
      <SettingsGroup>
        <SettingsRow icon={UserPlus} tone="red" title={texts.add} subtitle={texts.addText} href={ADD_HREF} />
        <SettingsRow icon={Users} tone="purple" title={texts.manageTeam} subtitle={texts.manageTeamText} href={LICENSING_HREF} />
        <SettingsRow icon={Wallet} tone="gray" title={texts.invoices} subtitle={texts.invoicesText} onClick={() => setInvoicesOpen(true)} />
      </SettingsGroup>
      <InvoicesDialog open={invoicesOpen} onClose={() => setInvoicesOpen(false)} />
    </motion.section>
  );
}
