import { useLastDefined } from "../../hooks/useLastDefined";
import { formatEuro } from "../../lib/crm/crmFormat";
import type { AdminSale } from "../../lib/crmOverview/overviewTypes";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import ConfirmDialog from "../profile/ConfirmDialog";

/** Was gelöscht werden soll: ein Produkt (mit Kunde) oder mehrere aus Auswahl bzw. Kunde. */
export type OverviewConfirm = { sales: readonly AdminSale[] };

interface OverviewDialogsProps {
  confirm: OverviewConfirm | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (confirm: OverviewConfirm) => void;
}

const Line = ({ label, value }: { label: string; value: string }) => (
  <p className="flex justify-between gap-3 text-[13px]">
    <span>{label}</span>
    <span className="max-w-[60%] truncate text-right font-medium text-foreground">{value}</span>
  </p>
);

/** Rückfrage vor dem endgültigen Löschen, wie die v1-Dialoge mit Kunde, Verkäufer, Produkt und Provision. */
export default function OverviewDialogs({ confirm, busy, onClose, onConfirm }: OverviewDialogsProps) {
  const shown = useLastDefined(confirm);
  const sales = shown?.sales ?? [];
  const one = sales.length === 1 ? sales[0] : undefined;
  const sum = sales.reduce((n, s) => n + s.commissionEuro, 0);
  return (
    <ConfirmDialog open={!!confirm} title={one ? t.deleteOneTitle : t.deleteManyTitle(sales.length)} confirmLabel={t.delete} cancelLabel={t.back} busy={busy} onClose={onClose} onConfirm={() => shown && onConfirm(shown)}>
      {one ? <p>{t.deleteOneBody(one.type, one.customerName)}</p> : <p>{t.deleteManyBody}</p>}
      <div className="mt-3 space-y-1">
        {one && <Line label={t.sellerLabel} value={one.userName} />}
        {one && <Line label={t.address} value={one.address || t.noAddress} />}
        <Line label={t.commission} value={formatEuro(sum)} />
      </div>
    </ConfirmDialog>
  );
}
