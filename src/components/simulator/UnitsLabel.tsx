import { unitsText } from "../../lib/simulator/simulatorFormat";

interface UnitsLabelProps {
  count: number;
  /** Energie zählt Verträge statt Produkte */
  contracts?: boolean;
}

/** "1 Produkt" / "3 Produkte" (bzw. Verträge). */
export default function UnitsLabel({ count, contracts = false }: UnitsLabelProps) {
  return <>{unitsText(count, contracts)}</>;
}
