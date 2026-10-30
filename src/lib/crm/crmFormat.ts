import { monthLabel } from "../abrechnung/abrechnungFormat";

const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const DATE = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const formatEuro = (n: number) => EURO.format(n);
export const formatDateTime = (timestamp: string) => DATE.format(new Date(timestamp));
export const currentMonthLabel = (now = new Date()) => monthLabel({ month: now.getMonth(), year: now.getFullYear() });
