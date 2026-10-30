/** Lead-Bonus aus v1: ab 100 Netto-Leads im Monat gibt es rückwirkend 10 € mehr je Lead. */
export const LEAD_BONUS_TARGET = 100;
export const LEAD_BONUS_EURO = 10;

export function leadBonus(leads: number) {
  return {
    progress: Math.min(100, (leads / LEAD_BONUS_TARGET) * 100),
    remaining: Math.max(0, LEAD_BONUS_TARGET - leads),
    reached: leads >= LEAD_BONUS_TARGET,
  };
}
