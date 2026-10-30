import type { CalculatorState } from "../../hooks/useCalculatorState";
import CalculatorDisplay from "./CalculatorDisplay";
import CalculatorHistory from "./CalculatorHistory";
import CalculatorKeypad from "./CalculatorKeypad";
import { GLASS_CARD } from "../glass/glassStyles";

interface CalculatorCardProps {
  calc: CalculatorState;
}

/** Die Rechner-Karte aus v1 (max-w-md) als Glaskarte. */
export default function CalculatorCard({ calc }: CalculatorCardProps) {
  return (
    <div className={`${GLASS_CARD} mx-auto w-full max-w-md p-3 pt-3.5 md:p-5 md:pt-6`}>
      <div className="space-y-2.5 sm:space-y-3">
        <CalculatorDisplay
          expr={calc.expr}
          result={calc.result}
          justCopied={calc.justCopied}
          onExprChange={calc.setExpr}
          onCopy={calc.copy}
        />
        <CalculatorHistory history={calc.history} onRecall={calc.recallFromHistory} onClear={calc.clearHistory} />
      </div>
      <div className="h-3 sm:h-4 md:h-5" />
      <CalculatorKeypad
        onAppend={calc.append}
        onClear={calc.clear}
        onBack={calc.back}
        onEquals={calc.calculateEquals}
        onNextParen={calc.nextParen}
        onApplyVAT={calc.applyVAT}
      />
    </div>
  );
}
