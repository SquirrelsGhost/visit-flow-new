import { Download, Loader2 } from "lucide-react";
import { useFormTexts } from "../../../hooks/useFormTexts";
import { GLASS_BUTTON } from "../../glass/glassStyles";

interface FormSubmitButtonProps {
  busy: boolean;
  onClick: () => void;
}

/** Hauptknopf "PDF erstellen", klebt unten im Sheet, damit er bei langen Formularen erreichbar bleibt. */
export default function FormSubmitButton({ busy, onClick }: FormSubmitButtonProps) {
  const texts = useFormTexts();
  return (
    <div className="sticky -bottom-7 z-10 -mx-5 -mb-7 bg-gradient-to-t from-[rgba(246,247,251,0.97)] via-[rgba(246,247,251,0.9)] to-transparent px-5 pt-4 pb-7 dark:from-[rgba(14,16,25,0.97)] dark:via-[rgba(14,16,25,0.9)]">
      <button type="button" onClick={onClick} disabled={busy} aria-busy={busy} className={GLASS_BUTTON}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Download className="h-4 w-4" />}
        {busy ? texts.generating : texts.generate}
      </button>
    </div>
  );
}
