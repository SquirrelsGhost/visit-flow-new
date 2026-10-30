import { SlidersHorizontal } from "lucide-react";
import { useId } from "react";
import { useLastDefined } from "../../hooks/useLastDefined";
import { salesOn } from "../../lib/battle/arenaScore";
import type { BattleProduct } from "../../lib/battle/battleTypes";
import { battleDialogTexts as t, battleTexts } from "../../texts/battleTexts";
import Modal from "../ui/Modal";
import SaleToggleRow from "./SaleToggleRow";

interface SalesManageDialogProps {
  member: { userId: string; name: string } | null;
  products: BattleProduct[];
  today: string;
  isBusy: (key: string) => boolean;
  onToggle: (productId: string, excluded: boolean) => void;
  onClose: () => void;
}

/** "Sales verwalten": welche heutigen Sales einer Person fürs Battle zählen (Admin/Teamleiter). */
export default function SalesManageDialog({ member: open, products, today, isBusy, onToggle, onClose }: SalesManageDialogProps) {
  const titleId = useId();
  const member = useLastDefined(open);
  // Alle heutigen Sales, auch ausgeschlossene, damit man sie wieder einschalten kann
  const sales = member ? (salesOn(products, member.userId, today) as BattleProduct[]) : [];
  return (
    <Modal open={open !== null} onClose={onClose} labelledBy={titleId} className="max-w-md">
      <div className="p-6">
        <h2 id={titleId} className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.02em] text-foreground">
          <SlidersHorizontal className="h-5 w-5 text-red-500" />
          {t.salesTitle(member?.name ?? "")}
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">{t.salesBody}</p>
        <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {sales.length === 0 ? (
            <div className="py-6 text-center text-[14px] text-muted-foreground">{t.salesEmpty}</div>
          ) : (
            sales.map((p) => (
              <SaleToggleRow key={p.id} sale={p} busy={isBusy(`exclude:${p.id}`)} onToggle={() => onToggle(p.id, !p.battleExcluded)} />
            ))
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="glass-surface mt-5 h-12 w-full rounded-2xl text-sm font-semibold text-foreground transition-colors hover:bg-[var(--glass-hover)]"
        >
          {battleTexts.close}
        </button>
      </div>
    </Modal>
  );
}
