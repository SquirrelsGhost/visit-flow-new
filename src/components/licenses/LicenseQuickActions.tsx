import { CreditCard, Plus, ReceiptText, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { riseIn } from "../../lib/motion/presets";
import { licenseTexts } from "../../texts/licenseTexts";
import GlassQuickAction from "../glass/GlassQuickAction";

interface LicenseQuickActionsProps {
  onAdd: () => void;
  onAssign: () => void;
  onInvoices: () => void;
  onPayment: () => void;
  busy: boolean;
}

const texts = licenseTexts.actions;

/** Die vier häufigsten Aufgaben direkt unter dem Kopf. */
export default function LicenseQuickActions({ onAdd, onAssign, onInvoices, onPayment, busy }: LicenseQuickActionsProps) {
  return (
    <motion.div variants={riseIn} className="flex justify-between gap-2 px-1">
      <GlassQuickAction icon={Plus} label={texts.add} onClick={onAdd} disabled={busy} />
      <GlassQuickAction icon={UserPlus} label={texts.assign} onClick={onAssign} disabled={busy} />
      <GlassQuickAction icon={ReceiptText} label={texts.invoices} onClick={onInvoices} />
      <GlassQuickAction icon={CreditCard} label={texts.payment} onClick={onPayment} />
    </motion.div>
  );
}
