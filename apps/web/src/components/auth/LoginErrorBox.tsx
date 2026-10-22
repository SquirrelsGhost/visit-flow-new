import { AlertCircle, ShieldOff, WifiOff } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { loginErrorKind, type LoginErrorKind } from "../../lib/auth/loginErrorKind";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { loginTexts } from "../../texts/loginTexts";

interface LoginErrorBoxProps {
  message: string;
}

/** Klappt weich auf und schüttelt kurz bei jeder neuen Meldung. Farben je Fehlerart wie in v1: gesperrte IP lila, Rate Limit orange, Netzwerk gelb, sonst rot. */
const STYLES: Record<LoginErrorKind, { box: string; badge: string; icon: string; title: string; text: string }> = {
  ipBlocked: {
    box: "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-900/50",
    badge: "bg-purple-100 dark:bg-purple-900/50",
    icon: "text-purple-600 dark:text-purple-400",
    title: "text-purple-800 dark:text-purple-300",
    text: "text-purple-700 dark:text-purple-400",
  },
  rateLimit: {
    box: "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-900/50",
    badge: "bg-orange-100 dark:bg-orange-900/50",
    icon: "text-orange-600 dark:text-orange-400",
    title: "text-orange-800 dark:text-orange-300",
    text: "text-orange-700 dark:text-orange-400",
  },
  network: {
    box: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/50",
    badge: "bg-amber-100 dark:bg-amber-900/50",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-800 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-400",
  },
  generic: {
    box: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50",
    badge: "bg-red-100 dark:bg-red-900/50",
    icon: "text-red-500 dark:text-red-400",
    title: "text-red-700 dark:text-red-400",
    text: "text-red-600 dark:text-red-400",
  },
};

export default function LoginErrorBox({ message }: LoginErrorBoxProps) {
  const kind = loginErrorKind(message);
  const style = STYLES[kind];
  const Icon = kind === "ipBlocked" ? ShieldOff : kind === "network" ? WifiOff : AlertCircle;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={SOFT_SPRING}
      className="overflow-hidden"
    >
      <div
        key={message}
        role="alert"
        data-error-kind={kind}
        className={cn("flex items-center space-x-3 p-4 rounded-xl border-2 animate-shake", style.box)}
      >
        <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", style.badge)}>
          <Icon className={cn("h-5 w-5", style.icon)} />
        </div>
        <div className="flex-1">
          <p className={cn("text-sm font-semibold mb-0.5", style.title)}>{loginTexts.errorTitle[kind]}</p>
          <p className={cn("text-sm", style.text)}>{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
