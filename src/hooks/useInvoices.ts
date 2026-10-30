import { useEffect, useState } from "react";
import { loadInvoices } from "../lib/profile/profileApi";
import type { Invoice } from "../lib/profile/profileTypes";

/** Lädt die Rechnungen erst, wenn der Dialog aufgeht (v1 gleicht dabei mit Stripe ab). undefined = lädt. */
export function useInvoices(open: boolean): Invoice[] | undefined {
  const [invoices, setInvoices] = useState<Invoice[] | undefined>(undefined);
  useEffect(() => {
    if (!open) return;
    let alive = true;
    void loadInvoices().then((list) => alive && setInvoices(list));
    return () => {
      alive = false;
    };
  }, [open]);
  return invoices;
}
