// Welcher Schalter gerade bestätigt wird, ist lokaler State
"use client";

import { MailCheck, ServerCog, TriangleAlert, UserPlus, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useSystemFlags } from "../../hooks/useSystemFlags";
import type { SystemFlag } from "../../lib/admin/adminTypes";
import { feedback } from "../../lib/feedback/feedback";
import type { GlassTone } from "../../lib/glass/glassTones";
import { adminTexts } from "../../texts/adminTexts";
import GlassIcon from "../glass/GlassIcon";
import GlassRow from "../glass/GlassRow";
import GlassRowText from "../glass/GlassRowText";
import GlassSection from "../glass/GlassSection";
import GlassSwitch from "../glass/GlassSwitch";
import { GLASS_ROW, GLASS_ROW_INTERACTIVE } from "../glass/glassStyles";
import AdminFlagSheet from "./AdminFlagSheet";

const texts = adminTexts.system;
const FLAGS: readonly { key: SystemFlag; icon: LucideIcon; tone: GlassTone }[] = [
  { key: "maintenanceMode", icon: ServerCog, tone: "orange" },
  { key: "allowRegistration", icon: UserPlus, tone: "blue" },
  { key: "bypassCompanyEmailRequirement", icon: MailCheck, tone: "red" },
];

/** Globale Schalter wie in v1; jeder Wechsel wird erst bestätigt, weil er sofort für alle gilt. */
export interface AdminSystemCardProps { readonly _?: never; }

export default function AdminSystemCard() {
  const { flags, busy, toggle } = useSystemFlags();
  const [asking, setAsking] = useState<SystemFlag | null>(null);

  return (
    <GlassSection label={texts.label} footer={texts.footer}>
      {flags === null && <GlassRow icon={TriangleAlert} tone="gray" title={texts.unavailable} />}
      {flags !== null &&
        FLAGS.map((flag) => {
          const on = flags?.[flag.key] ?? false;
          return (
            <button
              key={flag.key}
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={texts.flags[flag.key].title}
              disabled={!flags || busy !== null}
              onClick={() => {
                feedback("tap");
                setAsking(flag.key);
              }}
              className={`${GLASS_ROW} ${GLASS_ROW_INTERACTIVE} disabled:cursor-wait`}
            >
              <GlassIcon icon={flag.icon} tone={on ? flag.tone : "gray"} />
              <GlassRowText title={texts.flags[flag.key].title} subtitle={texts.flags[flag.key].text} />
              <GlassSwitch checked={on} />
            </button>
          );
        })}
      <AdminFlagSheet
        flag={asking}
        on={asking && flags ? flags[asking] : false}
        onClose={() => setAsking(null)}
        onConfirm={() => {
          if (asking) void toggle(asking);
          setAsking(null);
        }}
      />
    </GlassSection>
  );
}
