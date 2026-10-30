export interface MonthOption {
  value: string;
  label: string;
}

const PAST_MONTHS = 60;
const FUTURE_MONTHS = 3;

/** Vertragsstart-Auswahl wie v1: fünf Jahre zurück bis drei Monate voraus, neueste zuerst. */
export function contractStartOptions(today = new Date()): MonthOption[] {
  const format = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });
  const options: MonthOption[] = [];
  for (let offset = FUTURE_MONTHS; offset >= -PAST_MONTHS; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    options.push({ value: `${date.getFullYear()}-${month}-01`, label: format.format(date) });
  }
  return options;
}
