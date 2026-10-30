import { CreditCard, TriangleAlert } from "lucide-react";
import type { AdminRevenue } from "../../lib/admin/adminTypes";
import { eur } from "../../lib/tariff/eur";
import { adminTexts } from "../../texts/adminTexts";
import { fill } from "../../texts/profileTexts";
import GlassNumber from "../glass/GlassNumber";
import GlassRow from "../glass/GlassRow";
import AdminPanel from "./AdminPanel";
import AdminTile from "./AdminTile";

interface AdminLicensesCardProps {
  /** undefined = lädt, null = nicht verfügbar. */
  revenue: AdminRevenue | null | undefined;
}

const texts = adminTexts.licenses;
const LICENSING_HREF = "/subscription?licensing=true";

/** Abos und Lizenzen: Monatsumsatz groß, darunter Abos, Plätze und was wegfällt. */
export default function AdminLicensesCard({ revenue }: AdminLicensesCardProps) {
  return (
    <AdminPanel label={texts.label} className="p-0">
      {revenue === undefined && <div aria-hidden className="h-44 animate-pulse" />}
      {revenue === null && <GlassRow icon={TriangleAlert} tone="gray" title={texts.unavailable} />}
      {revenue && (
        <div className="p-4 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{texts.mrr}</p>
          <p className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.03em] text-foreground">
            <GlassNumber value={revenue.mrr} kind="euro" />
          </p>
          {revenue.lostMrr > 0 && <p className="mt-1.5 text-[12.5px] text-muted-foreground">{fill(texts.lost, { amount: eur(revenue.lostMrr) })}</p>}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <AdminTile label={texts.subs} value={revenue.activeSubscriptions} />
            <AdminTile label={texts.seats} value={revenue.licenses} />
            <AdminTile label={texts.breached} value={revenue.breached} warn />
            <AdminTile label={texts.canceled} value={revenue.canceled} warn />
          </div>
        </div>
      )}
      <div className="border-t border-[var(--glass-divider)]">
        <GlassRow icon={CreditCard} tone="rose" title={texts.manage} href={LICENSING_HREF} />
      </div>
    </AdminPanel>
  );
}
