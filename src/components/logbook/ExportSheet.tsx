// Auswahl und Download laufen im Browser
"use client";

import { AlertTriangle, CalendarDays, CalendarRange, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadText } from "../../lib/abrechnung/reklamationExport";
import { logbookCsv } from "../../lib/logbook/logbookExport";
import { formatKm } from "../../lib/logbook/logbookFormat";
import { summarize, tripsInMonth, tripsInYear } from "../../lib/logbook/logbookLogic";
import { logbookHtml, printHtml } from "../../lib/logbook/logbookPrint";
import { monthId } from "../../lib/logbook/logbookDates";
import type { LogbookData, MonthRef } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_LABEL } from "../glass/glassStyles";
import OptionTile from "./OptionTile";

interface ExportSheetProps {
  open: boolean;
  data: LogbookData;
  month: MonthRef;
  monthLabel: string;
  openIssues: number;
  driver: string;
  t: LogbookTexts;
  onClose: () => void;
}

type Range = "month" | "year";
type Format = "pdf" | "csv";

/** Export für Steuerberatung und Finanzamt (v1: PDF je Monat): Monat oder ganzes Jahr, als Druck-PDF oder CSV. */
export default function ExportSheet({ open, data, month, monthLabel, openIssues, driver, t, onClose }: ExportSheetProps) {
  const [range, setRange] = useState<Range>("month");
  const [format, setFormat] = useState<Format>("pdf");
  const trips = range === "month" ? tripsInMonth(data.trips, month) : tripsInYear(data.trips, month.year);
  const period = range === "month" ? monthLabel : t.exportYear(month.year);
  const sum = summarize(trips);

  const run = () => {
    if (trips.length === 0) return void toast.info(t.exportEmpty);
    const input = { trips, vehicles: data.vehicles, driver, period };
    const file = t.fileName(range === "month" ? monthId(month) : String(month.year));
    if (format === "csv") downloadText(logbookCsv(input, t), `${file}.csv`);
    else if (!printHtml(logbookHtml(input, data.locks, t))) return void toast.error(t.printBlocked);
    toast.success(t.exported);
    onClose();
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={t.exportTitle} subtitle={t.exportHint}>
      <div>
        <p className={GLASS_LABEL}>{t.exportRange}</p>
        <div role="radiogroup" aria-label={t.exportRange} className="flex gap-2.5">
          <OptionTile icon={CalendarDays} title={t.exportMonth(monthLabel)} hint={formatKm(summarize(tripsInMonth(data.trips, month)).totalKm, t)} selected={range === "month"} onSelect={() => setRange("month")} />
          <OptionTile icon={CalendarRange} title={t.exportYear(month.year)} hint={formatKm(summarize(tripsInYear(data.trips, month.year)).totalKm, t)} selected={range === "year"} onSelect={() => setRange("year")} />
        </div>
      </div>
      <div>
        <p className={GLASS_LABEL}>{t.exportFormat}</p>
        <div role="radiogroup" aria-label={t.exportFormat} className="flex gap-2.5">
          <OptionTile icon={FileText} title={t.exportPdf} hint={t.exportPdfHint} selected={format === "pdf"} onSelect={() => setFormat("pdf")} />
          <OptionTile icon={FileSpreadsheet} title={t.exportCsv} hint={t.exportCsvHint} selected={format === "csv"} onSelect={() => setFormat("csv")} />
        </div>
      </div>
      <p className="px-1 text-[13px] text-muted-foreground">{trips.length ? t.exportCount(sum.trips, formatKm(sum.totalKm, t)) : t.exportEmpty}</p>
      {openIssues > 0 && range === "month" && (
        <p className="flex items-start gap-1.5 px-1 text-[12.5px] leading-snug text-amber-700 dark:text-amber-300">
          <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t.exportOpenIssues(openIssues)}
        </p>
      )}
      <button type="button" onClick={run} disabled={trips.length === 0} className={GLASS_BUTTON}>
        {t.exportButton}
      </button>
    </GlassSheet>
  );
}
