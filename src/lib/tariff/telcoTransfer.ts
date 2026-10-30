import type { TransferProduct } from "./pencilSellStorage";
import { internetName } from "./telcoOffer";
import type { TelcoQuote } from "./telcoQuote";
import type { TelcoMeta, TelcoState } from "./telcoTypes";

const KAS_IDS = ["tv_connect", "tv_connect_standard", "tv_basic"];

/** Gewählte Produkte für "Zum Verkauf übernehmen" (v1 handleTransferToSale). */
export function transferProducts(s: TelcoState, meta: TelcoMeta, q: TelcoQuote): TransferProduct[] {
  const products: TransferProduct[] = [];
  const internet = internetName(s, meta);
  if (internet) products.push({ category: s.portfolio === "kabel-upsell" ? "Upsell" : "KIP", type: internet, quantity: 1 });
  if (s.gigaId !== "none" && q.add.giga) {
    products.push({ category: KAS_IDS.includes(s.gigaId) ? "KAS" : "GigaTV", type: q.add.giga.name, quantity: 1 });
  }
  if (s.mobileId !== "none" && q.add.mobile) products.push({ category: "Mobile", type: q.add.mobile.name, quantity: 1 });
  if (s.routerId !== "none" && q.add.router) products.push({ category: "Zubehör", type: q.add.router.name, quantity: 1 });
  return products;
}
