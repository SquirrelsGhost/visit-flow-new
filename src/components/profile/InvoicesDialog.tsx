import { Loader2 } from "lucide-react";
import { useId } from "react";
import { useInvoices } from "../../hooks/useInvoices";
import { profileTexts } from "../../texts/profileTexts";
import Modal from "../ui/Modal";
import { ROW_DIVIDER } from "../settings/settingsStyles";
import InvoiceRow from "./InvoiceRow";

interface InvoicesDialogProps {
  open: boolean;
  onClose: () => void;
}

const texts = profileTexts.subscription;

/** Rechnungen des Abos (v1 Rechnungs-Dialog) als ruhige Liste. */
export default function InvoicesDialog({ open, onClose }: InvoicesDialogProps) {
  const titleId = useId();
  const invoices = useInvoices(open);
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="glass-surface glass-blur bg-[var(--glass-fill-strong)] dark:bg-[var(--glass-fill-strong)] max-w-md rounded-[28px] border-0">
      <div className="px-5 pb-2 pt-5">
        <h2 id={titleId} className="text-[17px] font-semibold text-foreground">
          {texts.invoices}
        </h2>
        <p className="text-[13px] text-muted-foreground">{texts.invoicesText}</p>
      </div>
      <div className="max-h-[55vh] overflow-y-auto">
        {invoices === undefined ? (
          <p className="flex items-center justify-center gap-2 py-10 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
            {texts.invoicesLoading}
          </p>
        ) : invoices.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-muted-foreground">{texts.invoicesEmpty}</p>
        ) : (
          <ul className={ROW_DIVIDER}>
            {invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </ul>
        )}
      </div>
      <div className="p-4">
        <button type="button" onClick={onClose} className="h-11 w-full rounded-xl bg-slate-100 text-sm font-semibold text-foreground transition-colors hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]">
          {texts.close}
        </button>
      </div>
    </Modal>
  );
}
