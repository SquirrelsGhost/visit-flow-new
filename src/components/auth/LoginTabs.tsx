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

interface TabDef {
  value: LoginTab;
  label: string;
  short: string;
  Icon: LucideIcon;
}

const ORDER: LoginTab[] = ["onboarding", "login", "register"];
const GLIDE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0";
const TRIGGER =
  "no-touch-target-fix relative flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full bg-transparent px-2 text-[13px] font-medium tracking-tight shadow-none transition-colors duration-300 touch-manipulation data-[state=active]:bg-transparent data-[state=active]:shadow-none text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100";

/**
 * Schlanke Reiterleiste in einer Zeile mit kurzen Beschriftungen; der volle Name steht im Tooltip.
 * Die Pille liegt einmal in der Leiste und gleitet nur waagerecht zum gewählten Reiter (reines translateX),
 * so springt sie nie nach oben oder unten. Beim Team-Buchen blendet sie weich in den roten Verlauf über.
 */
export default function LoginTabs({ active }: LoginTabsProps) {
  const { t } = useTranslation();
  const tabs: TabDef[] = [
    { value: "onboarding", label: loginTexts.tabOnboarding, short: loginTexts.tabOnboardingShort, Icon: Rocket },
    { value: "login", label: t("auth.login"), short: t("auth.login"), Icon: LogIn },
    { value: "register", label: loginTexts.tabRegister, short: loginTexts.tabRegisterShort, Icon: UserPlus },
  ];
  const booking = active === "onboarding";
  const position = { "--i": ORDER.indexOf(active) } as CSSProperties;

  return (
    <motion.div variants={riseIn} className="px-5 sm:px-7 pt-4">
      <TabsList className="relative grid h-auto w-full grid-cols-3 gap-1 rounded-full bg-slate-100/70 p-1 ring-1 ring-inset ring-slate-200/70 backdrop-blur-sm dark:bg-white/[0.04] dark:ring-white/10">
        <span
          aria-hidden="true"
          style={position}
          className={cn(
            "pointer-events-none absolute left-1 top-1 bottom-1 w-[calc((100%-1rem)/3)] rounded-full transition-transform",
            "translate-x-[calc(var(--i)*(100%+0.25rem))]",
            GLIDE,
          )}
        >
          <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_4px_12px_-4px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.04] dark:ring-white/10" />
          <span
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-red-500 shadow-[0_6px_16px_-6px_rgba(220,38,38,0.55)] transition-opacity",
              GLIDE,
              booking ? "opacity-100" : "opacity-0",
            )}
          />
        </span>
        {tabs.map(({ value, label, short, Icon }) => {
          const selected = value === active;
          return (
            <TabsTrigger
              key={value}
              value={value}
              title={label}
              className={cn(
                TRIGGER,
                selected &&
                  (booking
                    ? "text-white hover:text-white data-[state=active]:text-white"
                    : "text-slate-900 data-[state=active]:text-slate-900 dark:text-white dark:data-[state=active]:text-white"),
              )}
            >
              <Icon className="relative hidden h-3.5 w-3.5 shrink-0 opacity-80 sm:block" strokeWidth={2} />
              <span className="relative truncate">{short}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </motion.div>
  );
}
