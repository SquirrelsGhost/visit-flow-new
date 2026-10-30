import { CornerDownLeft, Delete, Percent, Receipt } from "lucide-react";
import { calculatorTexts as t } from "../../texts/calculatorTexts";
import CalcKey from "./CalcKey";

interface CalculatorKeypadProps {
  onAppend: (value: string) => void;
  onClear: () => void;
  onBack: () => void;
  onEquals: () => void;
  onNextParen: () => "(" | ")";
  onApplyVAT: (rate: number) => void;
}

const ROWS = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "%", "+"],
] as const;

const OPERATORS = new Set(["/", "*", "-", "%", "+"]);

/** Tastenfeld aus v1: MwSt-Schnelltasten, Ziffern, Operatoren, Löschen, Gleich und schlaue Klammer. */
export default function CalculatorKeypad({ onAppend, onClear, onBack, onEquals, onNextParen, onApplyVAT }: CalculatorKeypadProps) {
  return (
    <>
      <div className="mb-2 grid grid-cols-5 gap-1.5 sm:mb-3 md:gap-2.5">
        <CalcKey tone="vat19" onPress={() => onApplyVAT(19)} className="col-span-2">
          <Receipt className="h-4 w-4 opacity-70 md:h-5 md:w-5" />
          {t.vat19}
        </CalcKey>
        <CalcKey tone="vat7" onPress={() => onApplyVAT(7)} className="col-span-2">
          <Percent className="h-4 w-4 opacity-70 md:h-5 md:w-5" />
          {t.vat7}
        </CalcKey>
        <CalcKey tone="clear" onPress={onClear} label={t.clear}>
          <Delete className="h-5 w-5 md:h-6 md:w-6" />
        </CalcKey>
      </div>
      <div className="grid grid-cols-4 gap-1.5 md:gap-2.5">
        {ROWS.flat().map((key) => (
          <CalcKey key={key} tone={OPERATORS.has(key) ? "operator" : "digit"} onPress={() => onAppend(key)}>
            {key}
          </CalcKey>
        ))}
        <CalcKey tone="operator" onPress={onBack} label={t.back}>
          <CornerDownLeft className="h-5 w-5" />
        </CalcKey>
        <CalcKey tone="equals" onPress={onEquals} label={t.equals} className="col-span-2">
          =
        </CalcKey>
        <CalcKey tone="operator" onPress={() => onAppend(onNextParen())} label={t.parens}>
          ( )
        </CalcKey>
      </div>
    </>
  );
}
