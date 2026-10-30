import { Check, Trash2, X } from "lucide-react";
import { cn } from "../../lib/cn";
import type { BackofficeAction } from "../../lib/backoffice/backofficeTypes";
import { backofficeTexts as t } from "../../texts/backofficeTexts";

interface BackofficeActionsProps {
  /** Welche Knöpfe es gibt; Löschen nur, wenn erlaubt. */
  actions: readonly BackofficeAction[];
  onAction: (action: BackofficeAction) => void;
  /** Mehrere Produkte: "Alle bestätigen" statt "Bestätigen". */
  many?: boolean;
  disabled?: boolean;
  /** Sammelleiste: Bestätigen als kräftiger grüner Knopf; auf Karten ruhiger getönt. */
  solid?: boolean;
}

const BASE = "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold transition-[background-color,filter,transform] duration-200 active:scale-[0.98] disabled:opacity-50 motion-reduce:transition-none";
const SOFT_COMPLETE = "flex-1 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300";
const STYLE: Record<BackofficeAction, string> = {
  complete: "flex-1 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-10px_rgba(16,185,129,0.8)] hover:brightness-110",
  cancel: "flex-1 bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-300",
  delete: "w-10 px-0 text-slate-500 hover:bg-slate-500/10 hover:text-red-500 dark:text-white/50",
};
const ICON = { complete: Check, cancel: X, delete: Trash2 } as const;

/** Entscheidungsknöpfe eines Kunden: Bestätigen grün, Stornieren rot, Löschen als stilles Symbol. */
export default function BackofficeActions({ actions, onAction, many = false, disabled = false, solid = false }: BackofficeActionsProps) {
  const label = (a: BackofficeAction) => (a === "complete" ? (many ? t.completeAll : t.complete) : a === "cancel" ? (many ? t.cancelAll : t.cancel) : t.delete);
  return (
    <div className="flex items-center gap-2">
      {actions.map((a) => {
        const Icon = ICON[a];
        return (
          <button key={a} type="button" disabled={disabled} onClick={() => onAction(a)} aria-label={a === "delete" ? label(a) : undefined} className={cn(BASE, a === "complete" && !solid ? SOFT_COMPLETE : STYLE[a])}>
            <Icon aria-hidden className="h-4 w-4" strokeWidth={a === "delete" ? 2 : 2.6} />
            {a !== "delete" && label(a)}
          </button>
        );
      })}
    </div>
  );
}
