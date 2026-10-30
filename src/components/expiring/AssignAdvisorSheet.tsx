// Auswahl und Suche leben im Browser
"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdvisors } from "../../hooks/useAdvisors";
import { useLastDefined } from "../../hooks/useLastDefined";
import { cn } from "../../lib/cn";
import type { Advisor, ExpiringContract } from "../../lib/expiring/expiringTypes";
import { expiringTexts as t } from "../../texts/expiringTexts";
import GlassSearchField from "../glass/GlassSearchField";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_INSET } from "../glass/glassStyles";
import AdvisorInitial from "./AdvisorInitial";
import { SOFT_BUTTON } from "./expiringStyles";

interface AssignAdvisorSheetProps {
  contract: ExpiringContract | null;
  busy: boolean;
  onClose: () => void;
  onAssign: (contract: ExpiringContract, advisor: Advisor | null) => Promise<boolean>;
}

/** v1 AssignAdvisorDialog als Sheet: Vertrag kurz oben, Berater suchen und wählen, zuweisen oder aufheben. */
export default function AssignAdvisorSheet({ contract, busy, onClose, onAssign }: AssignAdvisorSheetProps) {
  const shown = useLastDefined(contract);
  const advisors = useAdvisors(contract !== null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const current = picked ?? shown?.advisorId ?? null;

  const list = useMemo(() => {
    if (advisors.status !== "ready") return [];
    const q = query.trim().toLowerCase();
    return q ? advisors.advisors.filter((a) => a.name.toLowerCase().includes(q)) : advisors.advisors;
  }, [advisors, query]);

  const close = () => {
    setQuery("");
    setPicked(null);
    onClose();
  };
  const submit = async (advisor: Advisor | null) => {
    if (shown && (await onAssign(shown, advisor))) close();
  };
  const chosen = list.find((a) => a.id === current) ?? (advisors.status === "ready" ? advisors.advisors.find((a) => a.id === current) : undefined);

  return (
    <GlassSheet open={contract !== null} onClose={close} title={t.sheetTitle} subtitle={t.sheetSubtitle}>
      {shown && (
        <div className="space-y-4">
          <div className={cn(GLASS_INSET, "px-3.5 py-3 text-[13px]")}>
            <p className="font-semibold text-foreground">{shown.customerName}</p>
            <p className="mt-0.5 text-muted-foreground">
              {t.categoryLabel(shown.category)} · {t.days(shown.daysLeft)}
              {shown.address ? ` · ${shown.address}` : ""}
            </p>
          </div>
          <GlassSearchField value={query} onChange={setQuery} placeholder={t.advisorSearch} />
          <div role="radiogroup" aria-label={t.sheetTitle} className={cn(GLASS_INSET, "max-h-[38dvh] overflow-y-auto p-1")}>
            {advisors.status === "ready" && list.length === 0 && <p className="px-3 py-4 text-center text-[13px] text-muted-foreground">{t.advisorsEmpty}</p>}
            {advisors.status !== "ready" && <p className="px-3 py-4 text-center text-[13px] text-muted-foreground">{advisors.status === "failed" ? t.advisorsError : t.advisorsLoading}</p>}
            {list.map((a) => {
              const on = a.id === current;
              return (
                <button key={a.id} type="button" role="radio" aria-checked={on} onClick={() => setPicked(a.id)} className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-200", on ? "bg-red-500/10" : "hover:bg-[var(--glass-hover)]")}>
                  <AdvisorInitial name={a.name} active={on} />
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">{a.name}</span>
                  {on && <Check aria-hidden className="h-4 w-4 shrink-0 text-red-500" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
          <button type="button" disabled={busy || !chosen || chosen.id === shown.advisorId} onClick={() => chosen && void submit(chosen)} className={GLASS_BUTTON}>
            {chosen ? `${t.confirmAssign}: ${chosen.name}` : t.confirmAssign}
          </button>
          {shown.advisorId && (
            <button type="button" disabled={busy} onClick={() => void submit(null)} className={cn(SOFT_BUTTON, "w-full bg-red-500/10 text-red-600 hover:bg-red-500/15 disabled:opacity-60 dark:text-red-300")}>
              {t.clearAssign}
            </button>
          )}
        </div>
      )}
    </GlassSheet>
  );
}
