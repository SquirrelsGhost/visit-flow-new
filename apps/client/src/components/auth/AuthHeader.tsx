import { motion } from "motion/react";
import { useTranslation } from "../../hooks/useTranslation";
import { riseIn } from "../../lib/motion/presets";
import CardHeader from "../ui/CardHeader";
import CardTitle from "../ui/CardTitle";
import Sparkles from "../ui/Sparkles";
import AuthCompass from "./AuthCompass";

const BEAM = "absolute top-0 bg-gradient-to-r from-transparent to-transparent mx-auto";

/** Kopf der Login-Karte: Funkeln, Kompass, roter Titel mit Lichtstrahl (aus v1), erscheint nacheinander. */
export default function AuthHeader() {
  const { t } = useTranslation();
  return (
    <CardHeader className="text-center pb-8 pt-6 max-[700px]:pb-3 max-[700px]:pt-3 px-4 bg-gradient-to-b from-red-50/50 via-red-50/20 to-transparent dark:from-red-950/20 dark:via-red-950/5 dark:to-transparent relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Sparkles
          id="auth-header-sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.8}
          particleDensity={80}
          className="w-full h-full"
          particleColor="#ef4444"
          speed={1.5}
        />
      </div>

      <motion.div variants={riseIn}>
        <AuthCompass />
      </motion.div>

      <motion.div variants={riseIn} className="relative z-10 mb-3 max-[700px]:mb-1">
        <CardTitle className="text-5xl sm:text-6xl max-[700px]:text-3xl font-bold text-sheen tracking-tight">
          {t("app.title")}
        </CardTitle>

        <div className="relative w-full h-10 max-[700px]:h-6 mt-2 max-[700px]:mt-1">
          <div className={`${BEAM} inset-x-12 sm:inset-x-20 via-red-500 h-[2px] w-3/4 blur-sm`} />
          <div className={`${BEAM} inset-x-12 sm:inset-x-20 via-red-500 h-px w-3/4`} />
          <div className={`${BEAM} inset-x-24 sm:inset-x-32 via-red-400 h-[4px] w-2/4 blur-sm`} />
          <div className={`${BEAM} inset-x-24 sm:inset-x-32 via-red-400 h-px w-2/4`} />
          <Sparkles
            id="auth-title-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={600}
            className="w-full h-full [mask-image:radial-gradient(250px_100px_at_top,white_20%,transparent)]"
            particleColor="#ef4444"
            speed={2}
          />
        </div>
      </motion.div>

      <motion.p variants={riseIn} className="relative z-10 text-muted-foreground text-base sm:text-lg font-medium">
        {t("app.welcomeBack")}
      </motion.p>
    </CardHeader>
  );
}
