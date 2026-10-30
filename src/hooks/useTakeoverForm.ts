import { useState } from "react";
import { toast } from "sonner";
import { feedback } from "../lib/feedback/feedback";
import { buildTakeoverPdf, downloadPdf, type FilledPdf } from "../lib/forms/formPdf";
import type { TakeoverData, TakeoverParty } from "../lib/forms/formTypes";
import { emptyTakeover, takeoverProblem } from "../lib/forms/takeoverForm";
import { useFormTexts } from "./useFormTexts";

export type PartyKey = "previous" | "next";

/** Zustand der Vertragsübernahme; nach dem Erstellen bleibt das PDF für "erneut laden" und den Vodafone-Schritt. */
export function useTakeoverForm() {
  const texts = useFormTexts();
  const [data, setData] = useState<TakeoverData>(emptyTakeover);
  const [busy, setBusy] = useState(false);
  const [pdf, setPdf] = useState<FilledPdf | null>(null);

  const change = (patch: Partial<TakeoverData>) => setData((d) => ({ ...d, ...patch }));
  const changeParty = (who: PartyKey, patch: Partial<TakeoverParty>) => setData((d) => ({ ...d, [who]: { ...d[who], ...patch } }));

  const submit = async () => {
    const problem = takeoverProblem(data);
    if (problem) {
      feedback("error");
      return void toast.error(texts.takeover.problems[problem]);
    }
    setBusy(true);
    try {
      const filled = await buildTakeoverPdf(data);
      downloadPdf(filled);
      feedback("success");
      setPdf(filled);
    } catch {
      toast.error(texts.failed);
    } finally {
      setBusy(false);
    }
  };

  return { data, change, changeParty, submit, busy, pdf };
}
