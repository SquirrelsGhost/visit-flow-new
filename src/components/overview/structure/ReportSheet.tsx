// Kopieren und Teilen brauchen den Browser
"use client";

import { CalendarDays, CalendarRange, Copy, Share2, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { RankedMember, StructurePeriod } from "../../../lib/overview/structureLogic";
import { buildReport } from "../../../lib/overview/structureReport";
import { fill } from "../../../texts/profileTexts";
import { structureTexts } from "../../../texts/structureTexts";
import GlassSegmented from "../../glass/GlassSegmented";
import GlassSheet from "../../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_INSET } from "../../glass/glassStyles";

interface ReportSheetProps {
  open: boolean;
  rank: (period: StructurePeriod) => RankedMember[];
  now: Date;
  onClose: () => void;
}

const texts = structureTexts.report;
const ICONS = { day: Sun, week: CalendarRange, month: CalendarDays } as const;

/** Auswertung als fertiger Text (v1 Auswertungen-Dialog): Zeitraum wählen, ansehen, kopieren oder teilen. */
export default function ReportSheet({ open, rank, now, onClose }: ReportSheetProps) {
  const [period, setPeriod] = useState<StructurePeriod>("day");
  const text = buildReport(rank(period), period, now);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(fill(texts.copied, { label: texts.labels[period] }));
    } catch {
      toast.error(texts.failed);
    }
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={texts.title} subtitle={texts.hint}>
      <GlassSegmented label={structureTexts.periodsLabel} idPrefix="report-period" tone="soft" active={period} onChange={setPeriod} segments={(["day", "week", "month"] as const).map((id) => ({ id, label: structureTexts.periods[id], icon: ICONS[id] }))} />
      <pre className={`${GLASS_INSET} max-h-[40dvh] overflow-y-auto whitespace-pre-wrap px-4 py-3.5 font-sans text-[13px] leading-relaxed text-foreground`}>{text}</pre>
      <div className="flex gap-2">
        <button type="button" onClick={copy} className={GLASS_BUTTON}>
          <Copy aria-hidden className="h-4 w-4" />
          {texts.copy}
        </button>
        {canShare && (
          <button type="button" onClick={() => void navigator.share({ text }).catch(() => undefined)} aria-label={texts.share} className="glass-surface flex h-12 w-14 shrink-0 items-center justify-center rounded-2xl text-foreground">
            <Share2 aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>
    </GlassSheet>
  );
}
