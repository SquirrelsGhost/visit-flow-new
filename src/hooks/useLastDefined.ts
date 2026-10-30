import { useState } from "react";

/**
 * Behält den letzten Wert ungleich null. So bleibt der Inhalt eines Dialogs stehen,
 * während er nach dem Schließen noch ausgeblendet wird.
 */
export function useLastDefined<T>(value: T | null): T | null {
  const [last, setLast] = useState(value);
  if (value !== null && value !== last) setLast(value);
  return value ?? last;
}
