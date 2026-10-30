import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/cn";
import { riseIn, SOFT_SPRING, staggerParent } from "../../lib/motion/presets";
import { formatEuro, monthlyTotal } from "../../lib/onboarding/licenses";
import type { CreatedTeam } from "../../lib/onboarding/onboardingApi";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import BusyLabel from "./BusyLabel";
import InviteLinkBox from "./InviteLinkBox";
import { PRIMARY } from "./onboardingClasses";
import SuccessStat from "./SuccessStat";

interface OnboardingSuccessProps {
  team: CreatedTeam;
  licenses: number;
  assigned: number;
  email: string;
  password: string;
}

const DASHBOARD = "/teamleiter-dashboard?onboarded=1";

/** Fertig-Ansicht nach dem Buchen. Öffnet das Dashboard über die normale Anmeldung, damit Sitzung und Cookie sauber stehen. */
export default function OnboardingSuccess({ team, licenses, assigned, email, password }: OnboardingSuccessProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [opening, setOpening] = useState(false);
  const booked = team.licenseCount ?? licenses;

  async function openDashboard() {
    setOpening(true);
    const result = await login(email, password, true);
    if (result.success) router.replace(DASHBOARD);
    else setOpening(false);
  }

  return (
    <motion.div className="space-y-5 py-1" variants={staggerParent(0.08, 0.15)} initial="hidden" animate="show">
      <motion.div variants={riseIn} className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ ...SOFT_SPRING, delay: 0.1 }}
          className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
        >
          <span aria-hidden="true" className="absolute inset-0 rounded-2xl bg-emerald-500/40 animate-ping [animation-iteration-count:2] motion-reduce:animate-none" />
          <CheckCircle2 className="relative h-7 w-7" />
        </motion.div>
        <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          {T.successBadge}
        </span>
        <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{T.successTitle(team.name)}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{T.successText}</p>
      </motion.div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SuccessStat label={T.statLicenses} value={T.statLicensesValue(booked)} highlight />
        <SuccessStat label={T.statAssigned} value={T.statAssignedValue(Math.max(assigned, (team.advisorEmails ?? []).length), booked)} />
        <SuccessStat label={T.statMonthly} value={formatEuro(monthlyTotal(booked))} />
      </div>
      <InviteLinkBox teamName={team.name} link={team.inviteLink} />
      <motion.div variants={riseIn}>
        <button
          type="button"
          disabled={opening}
          onClick={() => void openDashboard()}
          className={cn(PRIMARY, "h-14 w-full text-base")}
          data-testid="onboarding-open-dashboard"
        >
          {opening ? (
            <BusyLabel label={T.opening} />
          ) : (
            <>
              {T.openDashboard}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
