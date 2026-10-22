import { LogIn, Rocket, UserPlus, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import type { LoginTab } from "../../hooks/useLoginTab";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { loginTexts } from "../../texts/loginTexts";
import TabsList from "../ui/TabsList";
import TabsTrigger from "../ui/TabsTrigger";

interface LoginTabsProps {
  active: LoginTab;
}

const ORDER: LoginTab[] = ["onboarding", "login", "register"];
const TRIGGER =
  "relative z-[1] flex items-center justify-center gap-2 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-300 h-10 touch-manipulation text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white";
const EASE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * Reiter wie in v1 (auf dem Handy 48 px hoch, siehe base.css). Neu: Die Markierung gleitet zum gewählten Reiter, statt zu springen,
 * und wechselt dabei weich zwischen dem rot-orangen Verlauf und Weiß.
 */
export default function LoginTabs({ active }: LoginTabsProps) {
  const { t } = useTranslation();
  const tabs: { value: LoginTab; label: string; Icon: LucideIcon }[] = [
    { value: "onboarding", label: loginTexts.tabOnboarding, Icon: Rocket },
    { value: "login", label: t("auth.login"), Icon: LogIn },
    { value: "register", label: loginTexts.tabRegister, Icon: UserPlus },
  ];
  const booking = active === "onboarding";
  const position = { "--i": ORDER.indexOf(active) } as CSSProperties;

  return (
    <motion.div variants={riseIn} className="px-4 sm:px-6 pt-5">
      <TabsList className="relative grid grid-cols-1 sm:grid-cols-3 w-full bg-slate-100/90 dark:bg-neutral-900/90 p-1.5 h-auto gap-1.5 rounded-2xl border border-slate-200/80 dark:border-neutral-800">
        <span
          aria-hidden="true"
          style={position}
          className={cn(
            "absolute left-1.5 top-1.5 h-10 max-[768px]:h-12 w-[calc(100%-0.75rem)] sm:w-[calc((100%-1.5rem)/3)] rounded-xl transition-transform",
            "translate-y-[calc(var(--i)*(100%+0.375rem))] sm:translate-y-0 sm:translate-x-[calc(var(--i)*(100%+0.375rem))]",
            EASE,
          )}
        >
          <span className="absolute inset-0 rounded-xl bg-white dark:bg-neutral-800 shadow-sm ring-1 ring-black/5 dark:ring-white/5" />
          <span
            className={cn(
              "absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-md shadow-red-600/25 transition-opacity",
              EASE,
              booking ? "opacity-100" : "opacity-0",
            )}
          />
        </span>
        {tabs.map(({ value, label, Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={cn(
              TRIGGER,
              value === "onboarding" && "font-bold",
              value === active && (booking ? "text-white hover:text-white" : "text-slate-900 dark:text-white"),
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </motion.div>
  );
}
