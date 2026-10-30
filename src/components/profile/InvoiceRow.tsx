import { ExternalLink } from "lucide-react";
import { cn } from "../../lib/cn";
import type { Invoice, InvoiceStatus } from "../../lib/profile/profileTypes";
import { eur } from "../../lib/tariff/eur";
import { profileTexts } from "../../texts/profileTexts";

interface InvoiceRowProps {
  invoice: Invoice;
}

const texts = profileTexts.subscription;

const STATUS_TONE: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  open: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  void: "bg-red-500/10 text-red-600 dark:text-red-400",
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  uncollectible: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
};

const monthOf = (date: string) => (date ? new Date(date).toLocaleDateString("de-DE", { month: "long", year: "numeric" }) : "–");
const dayOf = (date: string) => (date ? new Date(date).toLocaleDateString("de-DE") : "");

/** Eine Rechnung: Monat, Status, Betrag; mit Link öffnet sie die Stripe-Ansicht in einem neuen Tab. */
export default function InvoiceRow({ invoice }: InvoiceRowProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-medium capitalize text-foreground">{monthOf(invoice.date)}</p>
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_TONE[invoice.status])}>{texts.invoiceStatus[invoice.status]}</span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{[dayOf(invoice.date), invoice.description].filter(Boolean).join(" · ")}</p>
      </div>
      <span className="shrink-0 text-[14px] font-medium tabular-nums text-foreground">{eur(invoice.amount / 100)}</span>
      {invoice.url && (
        <a href={invoice.url} target="_blank" rel="noopener noreferrer" aria-label={texts.invoiceOpen} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/[0.06]">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </li>
  );
}
