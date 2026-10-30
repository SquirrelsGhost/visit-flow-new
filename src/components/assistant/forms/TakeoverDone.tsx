import { CheckCircle2, Copy, Download, ExternalLink, FilePlus2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useFormTexts } from "../../../hooks/useFormTexts";
import { feedback } from "../../../lib/feedback/feedback";
import { downloadPdf, type FilledPdf } from "../../../lib/forms/formPdf";
import type { TakeoverData } from "../../../lib/forms/formTypes";
import { vodafoneTakeoverLink } from "../../../lib/forms/takeoverForm";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { GLASS_BUTTON } from "../../glass/glassStyles";
import GlassIcon from "../../glass/GlassIcon";
import { FORM_CARD, FORM_SECONDARY_BUTTON } from "./formStyles";

interface TakeoverDoneProps {
  data: TakeoverData;
  pdf: FilledPdf;
  onAnother: () => void;
}

/**
 * Abschluss der Vertragsübernahme. v1 öffnete die Vodafone-Seite nach 2 s von selbst, das blockieren
 * Browser als Popup; hier öffnet ein Tippen sie, Kundennummer kopieren ist ein eigener Knopf.
 */
export default function TakeoverDone({ data, pdf, onAnother }: TakeoverDoneProps) {
  const texts = useFormTexts().takeover;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.customerNumber.trim());
      feedback("copy");
      toast.success(texts.copied);
    } catch {
      toast.info(data.customerNumber);
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SOFT_SPRING} className={`${FORM_CARD} mx-auto max-w-md space-y-4 text-center`}>
      <GlassIcon icon={CheckCircle2} tone="green" className="mx-auto h-14 w-14" />
      <div>
        <h3 className="text-[17px] font-semibold text-foreground">{texts.doneTitle}</h3>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{texts.doneText}</p>
      </div>
      <a href={vodafoneTakeoverLink(data)} target="_blank" rel="noopener noreferrer" className={GLASS_BUTTON}>
        <ExternalLink className="h-4 w-4" />
        {texts.openVodafone}
      </a>
      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" onClick={copy} className={FORM_SECONDARY_BUTTON}>
          <Copy className="h-4 w-4" />
          {texts.copyNumber}
        </button>
        <button type="button" onClick={() => downloadPdf(pdf)} className={FORM_SECONDARY_BUTTON}>
          <Download className="h-4 w-4" />
          {texts.downloadAgain}
        </button>
      </div>
      <button type="button" onClick={onAnother} className="mx-auto flex items-center gap-1.5 py-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground">
        <FilePlus2 className="h-4 w-4" />
        {texts.newForm}
      </button>
    </motion.div>
  );
}
