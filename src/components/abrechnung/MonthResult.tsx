import type { Busy } from "../../hooks/useAbrechnung";
import { monthKey, monthName } from "../../lib/abrechnung/abrechnungFormat";
import { summarize } from "../../lib/abrechnung/abrechnungSummary";
import type { AbrechnungCategory, AbrechnungRecord, MonthRef } from "../../lib/abrechnung/abrechnungTypes";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import AbrechnungSkeleton from "./AbrechnungSkeleton";
import SummaryHero from "./SummaryHero";
import UploadCard from "./UploadCard";

interface MonthResultProps {
  loading: boolean;
  record: AbrechnungRecord | null;
  monthRef: MonthRef;
  category: AbrechnungCategory;
  replacing: boolean;
  busy: Busy;
  onUpload: (file: File | null, total?: number) => Promise<boolean>;
  onRecompare: () => void;
  onReplace: (replacing: boolean) => void;
  onDelete: () => void;
}

/** Kopf des Monats: lädt, zeigt das Ergebnis der Abrechnung oder (ohne Abrechnung / beim Ersetzen) den Upload. */
export default function MonthResult({ loading, record, monthRef, category, replacing, busy, onUpload, onRecompare, onReplace, onDelete }: MonthResultProps) {
  const key = monthKey(monthRef);
  if (loading) return <AbrechnungSkeleton />;
  if (record && !replacing) {
    return (
      <SummaryHero
        key={`hero-${key}`}
        record={record}
        summary={summarize(record)}
        comparing={busy === "compare"}
        onRecompare={onRecompare}
        onReplace={() => onReplace(true)}
        onDelete={onDelete}
      />
    );
  }
  return (
    <UploadCard
      key={`upload-${key}`}
      monthName={monthName(monthRef.month)}
      salesDative={t.salesDative[category]}
      replacing={replacing}
      uploading={busy === "upload"}
      onUpload={onUpload}
      onCancelReplace={() => onReplace(false)}
    />
  );
}
