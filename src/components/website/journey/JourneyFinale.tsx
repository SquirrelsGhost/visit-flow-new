// Blendet am Ende der Reise ein: braucht den Browser
"use client";

import { Clock3, LogIn, Rocket } from "lucide-react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { WEBSITE_LAUNCHED, WEBSITE_LINKS } from "../../../lib/website/websiteLinks";
import { journeyFinale as t } from "../../../texts/websiteJourneyTexts";
import AccentText from "../ui/AccentText";
import CtaButton from "../ui/CtaButton";

/** Ende der Reise: Der Kompass liegt wieder oben, darunter "Bald für alle. Bleib dran." und die beiden Wege weiter. */
interface JourneyFinaleProps {
  progress: MotionValue<number>;
}

const LINE = "block font-[family-name:var(--vfw-display)] text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.055em]";

export default function JourneyFinale({ progress }: JourneyFinaleProps) {
  const opacity = useTransform(progress, [t.from, t.from + 0.04], [0, 1]);
  const y = useTransform(progress, [t.from, t.from + 0.05], [60, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));

  return (
    <motion.div style={{ opacity, y, visibility }} className="absolute inset-x-0 bottom-0 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center sm:pb-14">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[75%] bg-gradient-to-t from-[#05060b] via-[#05060b]/80 to-transparent" />
      <h2 className="text-white">
        <span className={LINE}>{t.title}</span>
        <span className={LINE}>
          <AccentText text={t.accent} />
        </span>
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-white/65">{t.lead}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {WEBSITE_LAUNCHED ? (
          <CtaButton href={WEBSITE_LINKS.onboarding} size="lg">
            {t.live} <Rocket className="size-5" />
          </CtaButton>
        ) : (
          <CtaButton href={WEBSITE_LINKS.features} size="lg" disabled>
            {t.soon} <Clock3 className="size-5" />
          </CtaButton>
        )}
        <CtaButton href={WEBSITE_LINKS.login} size="lg" variant="glass">
          {t.login} <LogIn className="size-5" />
        </CtaButton>
      </div>
    </motion.div>
  );
}
