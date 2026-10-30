import { Calendar, Hash, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { contractStartOptions } from "../../lib/register/monthOptions";
import type { PublicTeam } from "../../lib/register/registerApi";
import FormField from "../auth/FormField";
import SelectField from "./SelectField";

interface StepTeamProps {
  teams: PublicTeam[];
  teamId: string;
  onTeam: (id: string) => void;
  isVodafoneTeam: boolean;
  vpkn: string;
  onVpkn: (value: string) => void;
  contractStart: string;
  onContractStart: (value: string) => void;
}

const ICON = "h-[18px] w-[18px]";

/** Schritt 2: Team (optional), bei Vodafone die VPKN, und der Vertragsstart. */
export default function StepTeam(props: StepTeamProps) {
  const { t } = useTranslation();
  const months = useMemo(() => contractStartOptions(), []);
  return (
    <div className="space-y-4">
      <div className="mb-2 text-center">
        <h3 className="mb-1.5 text-xl font-bold tracking-tight text-foreground">{t("register.teamSelection.title")}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("register.teamSelection.description")}</p>
      </div>
      <SelectField id="team-select" label={t("register.teamSelection.label")} value={props.teamId} onChange={props.onTeam} icon={<Users className={ICON} strokeWidth={1.75} />} placeholder={t("register.teamSelection.placeholder")}>
        <option value="none">{t("register.teamSelection.none")}</option>
        {props.teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </SelectField>
      <AnimatePresence initial={false}>
        {props.isVodafoneTeam && (
          <motion.div key="vpkn" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
            <FormField
              id="register-vpkn"
              label="VPKN (optional)"
              value={props.vpkn}
              onChange={props.onVpkn}
              placeholder="Vodafone Partner Kennnummer"
              icon={<Hash className={ICON} strokeWidth={1.75} />}
              autoComplete="off"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <SelectField
        id="contract-start"
        label="Vertragsstart"
        value={props.contractStart}
        onChange={props.onContractStart}
        icon={<Calendar className={ICON} strokeWidth={1.75} />}
        placeholder="Wähle deinen Vertragsstart"
        required
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
