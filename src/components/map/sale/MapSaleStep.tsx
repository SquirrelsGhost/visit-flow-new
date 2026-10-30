// Braucht useState für Warenkorb, Kundentyp, Notiz und die aktuelle Unterseite
"use client";

import { useState } from "react";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { hapticFeedback } from "../../../lib/device/haptics";
import { colorForStatus, type VisitDetails } from "../../../lib/map/mapTypes";
import type { ProductCategory } from "../../../lib/map/productMeta";
import { saleCategories, type SaleCategory } from "../../../lib/map/saleCatalog";
import {
  addTariffToCart,
  changeQuantity,
  questionsFor,
  saleSummary,
  type SaleAnswers,
  type SaleProduct,
  type SaleQuestion,
  type SaleResult,
} from "../../../lib/map/saleProducts";
import { customerTypes } from "../../../lib/map/visitSteps";
import { clearTransfer, readTransfer } from "../../../lib/tariff/pencilSellStorage";
import type { Tariff } from "../../../lib/tariff/tariffTypes";
import MapStatusIcon from "../MapStatusIcon";
import MapChoiceGrid from "../steps/MapChoiceGrid";
import MapStepFrame from "../steps/MapStepFrame";
import { STEP_INPUT, STEP_LABEL } from "../steps/stepStyles";
import MapSaleCart from "./MapSaleCart";
import MapSaleQuestion from "./MapSaleQuestion";
import MapSaleTariffs from "./MapSaleTariffs";

interface MapSaleStepProps {
  vertical: Vertical;
  saving: boolean;
  onBack: () => void;
  onSave: (details: VisitDetails, sale: SaleResult) => void;
}

type View =
  | { kind: "cart" }
  | { kind: "tariffs"; category: SaleCategory }
  | { kind: "question"; category: SaleCategory; tariff: Tariff; queue: SaleQuestion[]; answers: SaleAnswers };

const STATUS = "Angetroffen → Sale" as const;

/** v1 SaleDialog als Schritt im Sheet: Produkte wählen, Rückfragen beantworten, Abschluss speichern. */
export default function MapSaleStep({ vertical, saving, onBack, onSave }: MapSaleStepProps) {
  // Aus dem Pencil Sell übernommene Produkte liegen schon im Warenkorb (v1 pencil_sell_transfer)
  const [cart, setCart] = useState<SaleProduct[]>(() => readTransfer() as SaleProduct[]);
  const [customerType, setCustomerType] = useState<string>();
  const [note, setNote] = useState("");
  const [view, setView] = useState<View>({ kind: "cart" });
  const color = colorForStatus(STATUS);
  const categories = saleCategories(vertical);

  const add = (category: ProductCategory, tariff: Tariff, answers: SaleAnswers) => {
    setCart((c) => addTariffToCart(c, category, tariff, answers));
    hapticFeedback("light");
    setView({ kind: "cart" });
  };

  const pick = (category: SaleCategory, tariff: Tariff, extras: Tariff[]) => {
    if (extras.length > 0) setCart((c) => extras.reduce((acc, t) => addTariffToCart(acc, category.id, t), c));
    const queue = questionsFor(tariff);
    if (queue.length === 0) add(category.id, tariff, {});
    else setView({ kind: "question", category, tariff, queue, answers: {} });
  };

  const answer = (patch: SaleAnswers) => {
    if (view.kind !== "question") return;
    const answers = { ...view.answers, ...patch };
    const queue = view.queue.slice(1);
    if (queue.length === 0) add(view.category.id, view.tariff, answers);
    else setView({ ...view, queue, answers });
  };

  const save = () => {
    const comment = [customerType, note.trim(), saleSummary(cart)].filter(Boolean).join(" | ");
    clearTransfer();
    onSave({ comment, customerType }, { products: cart, vertical, note: note.trim() });
  };

  if (view.kind === "tariffs") {
    return <MapSaleTariffs category={view.category} vertical={vertical} onBack={() => setView({ kind: "cart" })} onPick={(t, extras) => pick(view.category, t, extras)} />;
  }
  if (view.kind === "question") {
    return (
      <MapSaleQuestion
        key={view.queue[0]}
        question={view.queue[0]!}
        tariff={view.tariff}
        color={view.category.color}
        onBack={() => setView({ kind: "tariffs", category: view.category })}
        onAnswer={answer}
      />
    );
  }

  const total = cart.reduce((n, p) => n + p.quantity, 0);
  return (
    <MapStepFrame
      title="Abschluss"
      color={color}
      icon={<MapStatusIcon status={STATUS} vertical={vertical} size={18} />}
      saving={saving}
      canSave={cart.length > 0}
      saveLabel={cart.length > 0 ? `Speichern (${total})` : "Erst ein Produkt wählen"}
      onBack={onBack}
      onSave={save}
    >
      <MapSaleCart
        cart={cart}
        categories={categories}
        onOpenCategory={(category) => setView({ kind: "tariffs", category })}
        onQuantity={(i, d) => setCart((c) => changeQuantity(c, i, d))}
        onRemove={(i) => setCart((c) => c.filter((_, j) => j !== i))}
      />
      {cart.length > 0 && vertical !== "energy" && (
        <div>
          <span className={STEP_LABEL}>Kundentyp</span>
          <MapChoiceGrid choices={customerTypes(vertical)} value={customerType} onChange={setCustomerType} color={color} columns={3} toggle />
        </div>
      )}
      {cart.length > 0 && (
        <label className="block">
          <span className={STEP_LABEL}>Notiz</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Zusätzliche Informationen…" className={STEP_INPUT} />
        </label>
      )}
    </MapStepFrame>
  );
}
