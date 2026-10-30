import { Calendar, Eye, EyeOff, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useStoredFlag } from "../../../hooks/useStoredFlag";
import { HIDE_AMOUNTS_KEY, hiddenAmount } from "../../../lib/assistant/meStyles";
import type { MeMetrics } from "../../../lib/assistant/meTypes";
import { cn } from "../../../lib/cn";
import { hapticFeedback } from "../../../lib/device/haptics";
import { meTexts as t } from "../../../texts/assistantTexts";
import AnimatedNumber from "./AnimatedNumber";
import MeCard from "./MeCard";

const heroDate = () => new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

interface AmountProps {
  label: string;
  caption: string;
  value: number;
  hidden: boolean;
  icon: typeof Calendar;
  tone: { amount: string; euro: string };
  onToggle: () => void;
}

function Amount({ label, caption, value, hidden, icon: Icon, tone, onToggle }: AmountProps) {
  const Shown = hidden ? EyeOff : Icon;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      aria-label={t.toggleAmounts}
      aria-pressed={hidden}
      className="flex flex-col items-center gap-1 px-4 py-5 text-center focus-visible:outline-offset-[-8px]"
    >
      <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        <Shown className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className={cn("text-4xl leading-none font-black tabular-nums transition-[filter] duration-300", tone.amount, hiddenAmount(hidden))}>
        <AnimatedNumber value={value} />
        <span className={cn("text-xl font-bold", tone.euro)}>€</span>
      </span>
      <span className="text-[11px] font-medium text-slate-400">{caption}</span>
    </motion.button>
  );
}

/** "Deine Provision": heute und diese Woche; ein Tipp verbirgt oder zeigt die Beträge (gemerkt wie v1). */
export default function RevenueHero({ m }: { m: MeMetrics }) {
  const [hidden, toggle] = useStoredFlag(HIDE_AMOUNTS_KEY);
  const onToggle = () => {
    hapticFeedback("light");
    toggle();
  };
  return (
    <MeCard
      icon={TrendingUp}
      iconTone="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      title={t.commissionTitle}
      action={<span className="text-[11px] font-semibold text-slate-400 capitalize">{heroDate()}</span>}
      divided
    >
      <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
        <Amount
          label={t.today}
          caption={t.commissionToday}
          value={Math.round(m.todayRevenue)}
          hidden={hidden}
          icon={Eye}
          tone={{ amount: "text-green-600 dark:text-green-400", euro: "text-green-500/70" }}
          onToggle={onToggle}
        />
        <Amount
          label={t.thisWeek}
          caption={t.commissionThisWeek}
          value={Math.round(m.weekRevenue)}
          hidden={hidden}
          icon={Calendar}
          tone={{ amount: "text-blue-600 dark:text-blue-400", euro: "text-blue-500/70" }}
          onToggle={onToggle}
        />
      </div>
    </MeCard>
  );
}
