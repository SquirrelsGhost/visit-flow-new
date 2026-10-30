import { CheckCircle2, FileSpreadsheet, FileText } from "lucide-react";
import { motion } from "motion/react";
import { isExcelName } from "../../lib/abrechnung/abrechnungFormat";
import { STATUS_META, STATUS_ORDER } from "../../lib/abrechnung/abrechnungStatus";
import type { MonthSummary } from "../../lib/abrechnung/abrechnungSummary";
import type { AbrechnungRecord } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import AnimatedEuro from "../ui/AnimatedEuro";
import { CARD, MUTED, TONE_GLOW, TONE_TEXT } from "./abrechnungStyles";
import PayoutRing from "./PayoutRing";
import RecordMenu from "./RecordMenu";
import SollIstBars from "./SollIstBars";

interface SummaryHeroProps {
  record: AbrechnungRecord;
  summary: MonthSummary;
  comparing: boolean;
  onRecompare: () => void;
  onReplace: () => void;
  onDelete: () => void;
}

const HEADLINE = { ok: t.allPaid, missing: t.missing, extra: t.extra } as const;

/** Ergebnis des Monats: fehlt Geld, stimmt alles oder kam mehr? Mit Quote, Soll/Ist und Status-Zählern. */
export default function SummaryHero({ record, summary, comparing, onRecompare, onReplace, onDelete }: SummaryHeroProps) {
  const { tone, diff } = summary;
  const FileIcon = isExcelName(record.pdfFileName) ? FileSpreadsheet : FileText;
  return (
    <motion.section variants={riseIn} className={cn(CARD, "p-5")} aria-label={HEADLINE[tone]}>
      <div aria-hidden="true" className={cn("pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-gradient-to-br to-transparent blur-2xl", TONE_GLOW[tone])} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-neutral-400">
            {tone === "ok" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            {HEADLINE[tone]}
          </p>
          <p className={cn("mt-1 text-[38px] leading-none font-bold tracking-tight tabular-nums", TONE_TEXT[tone])}>
            {tone !== "ok" && <span>{diff > 0 ? "+" : "−"}</span>}
            <AnimatedEuro value={tone === "ok" ? summary.paid : Math.abs(diff)} from={0} duration={1} />
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STATUS_ORDER.filter((s) => summary.counts[s] > 0).map((s) => (
              <span key={s} className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STATUS_META[s].chip)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[s].dot)} />
                {summary.counts[s]} {STATUS_META[s].label}
              </span>
            ))}
          </div>
        </div>
        <PayoutRing rate={summary.rate} tone={tone} />
      </div>

      <SollIstBars expected={summary.expected} paid={summary.paid} tone={tone} />
      {summary.totalsOnly && <p className={cn(MUTED, "relative mt-3 text-pretty")}>{t.totalsOnly}</p>}

      <div className="relative mt-4 flex items-center gap-2.5 border-t border-slate-100 pt-2 dark:border-white/[0.06]">
        <FileIcon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate text-sm text-slate-500 dark:text-neutral-400">{record.pdfFileName || t.noFile}</span>
        <RecordMenu comparing={comparing} onRecompare={onRecompare} onReplace={onReplace} onDelete={onDelete} />
      </div>
    </motion.section>
  );
}
