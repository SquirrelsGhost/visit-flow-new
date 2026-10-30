import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useFormTexts } from "../../../hooks/useFormTexts";
import type { FormId } from "../../../lib/forms/formTypes";
import GlassSheet from "../../glass/GlassSheet";
import ChangeForm from "./ChangeForm";
import FormPicker from "./FormPicker";
import TakeoverForm from "./TakeoverForm";

interface FormsSheetProps {
  open: boolean;
  onClose: () => void;
}

const SWAP = { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2 } } as const;

/**
 * Vodafone-Formulare (v1 FormularDialog) als Glas-Sheet: erst die Auswahl, dann das Formular,
 * das ein ausgefülltes PDF erstellt. Beim nächsten Öffnen beginnt es wieder bei der Auswahl.
 */
export default function FormsSheet({ open, onClose }: FormsSheetProps) {
  const texts = useFormTexts();
  const [active, setActive] = useState<FormId | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setActive(null);
  }

  const subtitle = active ? (
    <button type="button" onClick={() => setActive(null)} className="-ml-1 flex items-center gap-1 rounded-full px-1 py-0.5 font-semibold text-red-600 hover:text-red-700 dark:text-red-400">
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      {texts.back}
    </button>
  ) : (
    texts.pickSubtitle
  );

  return (
    <GlassSheet open={open} onClose={onClose} title={active ? texts.forms[active].title : texts.title} subtitle={subtitle} wide>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={active ?? "pick"} {...SWAP}>
          {active === null && <FormPicker onPick={setActive} />}
          {active === "aenderung" && <ChangeForm onDone={onClose} />}
          {active === "uebernahme" && <TakeoverForm onAnother={() => setActive(null)} />}
        </motion.div>
      </AnimatePresence>
    </GlassSheet>
  );
}
