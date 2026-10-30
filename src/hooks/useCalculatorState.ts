import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { evaluate, nextParen as pickParen } from "../lib/calculator/calcEngine";

export interface HistoryEntry {
  expr: string;
  result: number;
}

const HISTORY_SIZE = 5;

/** Zustand des Taschenrechners aus v1 (useCalculatorState): Ausdruck, Ergebnis, Verlauf, MwSt. */
export function useCalculatorState() {
  const [expr, setRawExpr] = useState("");
  /** Direkt nach "=": Eine Ziffer beginnt eine neue Rechnung, ein Operator rechnet mit dem Ergebnis weiter. */
  const fresh = useRef(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justCopied, setJustCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const result = useMemo(() => evaluate(expr), [expr]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const setExpr = useCallback((value: string) => {
    fresh.current = false;
    setRawExpr(value);
  }, []);
  const append = useCallback((v: string) => {
    const restart = fresh.current && /[0-9.(]/.test(v);
    fresh.current = false;
    setRawExpr((e) => (restart ? v : e + v));
  }, []);
  const clear = useCallback(() => setExpr(""), [setExpr]);
  const back = useCallback(() => {
    fresh.current = false;
    setRawExpr((e) => e.slice(0, -1));
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(String(result ?? ""));
    } catch {
      return;
    }
    setJustCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setJustCopied(false), 1200);
  }, [result]);

  const applyVAT = useCallback(
    (rate: number) => setExpr(String(Number(((result ?? 0) * (1 + rate / 100)).toFixed(2)))),
    [result, setExpr],
  );

  const nextParen = useCallback(() => pickParen(expr), [expr]);

  /** "=": schreibt die Rechnung in den Verlauf (letzte 5) und übernimmt das Ergebnis. */
  const calculateEquals = useCallback(() => {
    if (result !== null && expr.trim()) {
      setHistory((prev) => [{ expr: expr.trim(), result }, ...prev].slice(0, HISTORY_SIZE));
    }
    setRawExpr(result === null ? "" : String(Number(result.toFixed(10))));
    fresh.current = result !== null;
  }, [result, expr]);

  const recallFromHistory = useCallback((entry: HistoryEntry) => setExpr(String(entry.result)), [setExpr]);
  const clearHistory = useCallback(() => setHistory([]), []);

  return {
    expr,
    setExpr,
    result,
    append,
    clear,
    back,
    copy,
    justCopied,
    applyVAT,
    nextParen,
    calculateEquals,
    history,
    recallFromHistory,
    clearHistory,
  };
}

export type CalculatorState = ReturnType<typeof useCalculatorState>;
