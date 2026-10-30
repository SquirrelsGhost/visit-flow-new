import { useContext, useState } from "react";
import { toast } from "sonner";
import { AuthContext } from "../lib/auth/authContext";
import { feedback } from "../lib/feedback/feedback";
import { changeProblem, emptyChange, toggleArea } from "../lib/forms/changeForm";
import { buildChangePdf, downloadPdf } from "../lib/forms/formPdf";
import type { ChangeArea, ChangeData } from "../lib/forms/formTypes";
import { useFormTexts } from "./useFormTexts";

/** Zustand der Änderungsmitteilung: vorbelegt aus dem Profil, Erstellen lädt das PDF und schließt. */
export function useChangeForm(onDone: () => void) {
  const user = useContext(AuthContext)?.user ?? null;
  const texts = useFormTexts();
  const [data, setData] = useState<ChangeData>(() => emptyChange(user));
  const [busy, setBusy] = useState(false);

  const change = (patch: Partial<ChangeData>) => setData((d) => ({ ...d, ...patch }));
  const toggle = (area: ChangeArea) => {
    feedback(data.areas.includes(area) ? "toggleOff" : "toggleOn");
    setData((d) => ({ ...d, areas: toggleArea(d.areas, area) }));
  };

  const submit = async () => {
    const problem = changeProblem(data);
    if (problem) {
      feedback("error");
      return void toast.error(texts.change.problems[problem]);
    }
    setBusy(true);
    try {
      downloadPdf(await buildChangePdf(data));
      feedback("success");
      toast.success(texts.change.done);
      onDone();
    } catch {
      toast.error(texts.failed);
    } finally {
      setBusy(false);
    }
  };

  return { data, change, toggle, submit, busy };
}
