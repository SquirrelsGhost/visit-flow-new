import { sql, type SQL } from "drizzle-orm";

/**
 * Feste Werteliste für CHECK-Constraints, z. B. `role in ('admin', 'berater')`. Nur für Konstanten
 * aus dem Code gedacht, nie für Eingaben: Die Werte landen roh im SQL der Migration.
 */
export function sqlList(values: readonly string[]): SQL {
  if (values.some((value) => !/^[a-z0-9_-]+$/i.test(value))) throw new Error("sqlList: nur einfache Bezeichner erlaubt");
  return sql.raw(values.map((value) => `'${value}'`).join(", "));
}
