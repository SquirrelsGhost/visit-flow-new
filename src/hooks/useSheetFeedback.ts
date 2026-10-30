import { useEffect, useRef } from "react";
import { feedback } from "../lib/feedback/feedback";

/** Weicher Luftzug, wenn ein Sheet oder Dialog auf- oder zugeht (nicht beim ersten Rendern). */
export function useSheetFeedback(open: boolean): void {
  const previous = useRef(open);
  useEffect(() => {
    if (previous.current === open) return;
    previous.current = open;
    feedback(open ? "sheetOpen" : "sheetClose");
  }, [open]);
}
