const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

/** Euro-Betrag in deutscher Schreibweise ("1.234,56 €"). */
export const eur = (n: number) => EUR.format(n);
