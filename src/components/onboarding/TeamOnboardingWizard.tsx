import { Building2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTeamOnboarding } from "../../hooks/useTeamOnboarding";
import { riseIn, staggerParent } from "../../lib/motion/presets";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import LoginErrorBox from "../auth/LoginErrorBox";
import IconInput from "./IconInput";
import LeaderAccessFields from "./LeaderAccessFields";
import LicensePanel from "./LicensePanel";
import OnboardingActions from "./OnboardingActions";
import OnboardingIntro from "./OnboardingIntro";
import OnboardingSuccess from "./OnboardingSuccess";
import OnboardingSwitchLinks from "./OnboardingSwitchLinks";
import StepLabel from "./StepLabel";

interface TeamOnboardingWizardProps {
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
}

/** Reiter "Eigenes Team buchen": Team, Einzel-Lizenzen und Zugang auf einem Bildschirm, Abschnitte erscheinen nacheinander. */
export default function TeamOnboardingWizard({ onSwitchToLogin, onSwitchToRegister }: TeamOnboardingWizardProps) {
  const { form, set, assigned, busy, error, createdTeam, submit } = useTeamOnboarding();

  if (createdTeam) return <OnboardingSuccess team={createdTeam} licenses={form.licenses} assigned={assigned} email={form.email.trim()} password={form.password} />;

  return (
    <motion.div className="space-y-6" variants={staggerParent(0.06, 0.1)} initial="hidden" animate="show">
      <motion.div variants={riseIn}>
        <OnboardingIntro />
      </motion.div>
      <AnimatePresence initial={false}>{error && <LoginErrorBox key="error" message={error} />}</AnimatePresence>
      <motion.section variants={riseIn} className="space-y-2">
        <StepLabel step={1} label={T.stepTeam} htmlFor="team-name" />
        <IconInput id="team-name" Icon={Building2} value={form.teamName} onChange={set.setTeamName} placeholder={T.teamPlaceholder} large autoComplete="organization" />
      </motion.section>
      <motion.div variants={riseIn}>
        <LicensePanel licenses={form.licenses} onLicenses={set.setLicenses} slots={form.slots} assigned={assigned} onSlot={set.setSlot} />
      </motion.div>
      <motion.div variants={riseIn} className="space-y-3">
        <LeaderAccessFields
          name={form.name}
          email={form.email}
          password={form.password}
          onName={set.setName}
          onEmail={set.setEmail}
          onPassword={set.setPassword}
        />
        <OnboardingActions busy={busy} onSubmit={(mode) => void submit(mode)} />
      </motion.div>
      <motion.div variants={riseIn}>
        <OnboardingSwitchLinks onLogin={onSwitchToLogin} onRegister={onSwitchToRegister} />
      </motion.div>
    </motion.div>
  );
}
