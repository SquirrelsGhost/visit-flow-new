import { CalendarClock, CreditCard, ReceiptText, Wallet } from "lucide-react";
import { formatDay, monthlyCost } from "../../lib/licenses/licenseLogic";
import type { TeamLicenses } from "../../lib/licenses/licenseTypes";
import { formatEuro, LICENSE_PRICE } from "../../lib/onboarding/licenses";
import { eur } from "../../lib/tariff/eur";
import { licenseTexts } from "../../texts/licenseTexts";
import { fill } from "../../texts/profileTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

interface BillingSectionProps {
  data: TeamLicenses;
  onCount: () => void;
  onInvoices: () => void;
  onPortal: () => void;
}

const texts = licenseTexts.billing;

/** Abrechnung: Betrag (öffnet Lizenzen anpassen), nächste Abbuchung, Rechnungen und Zahlungsmittel. */
export default function BillingSection({ data, onCount, onInvoices, onPortal }: BillingSectionProps) {
  return (
    <GlassSection label={texts.label} footer={texts.footer}>
      <GlassRow
        icon={Wallet}
        tone="red"
        title={texts.monthly}
        subtitle={fill(texts.monthlyText, { count: data.licenseCount, price: formatEuro(LICENSE_PRICE) })}
        value={eur(monthlyCost(data.licenseCount))}
        onClick={onCount}
      />
      <GlassRow icon={CalendarClock} tone="blue" title={texts.renews} value={formatDay(data.renewsAt)} />
      <GlassRow icon={ReceiptText} tone="gray" title={texts.invoices} subtitle={texts.invoicesText} onClick={onInvoices} />
      <GlassRow icon={CreditCard} tone="indigo" title={texts.portal} subtitle={texts.portalText} onClick={onPortal} />
    </GlassSection>
  );
}
