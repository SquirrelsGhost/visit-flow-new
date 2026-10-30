import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { saveTransfer, type TransferProduct } from "../lib/tariff/pencilSellStorage";
import { pencilSellSummaryTexts as t } from "../texts/pencilSellTexts";

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  el.remove();
}

/** Kopieren, Teilen und "Zum Verkauf übernehmen" eines Angebots (v1 copyOffer/shareOffer/handleTransferToSale). */
export function useOfferActions(text: string, products: () => TransferProduct[]) {
  const router = useRouter();

  const copy = useCallback(async () => {
    try {
      await writeClipboard(text);
      toast.success(t.copied);
    } catch {
      toast.error(t.copyFailed);
    }
  }, [text]);

  const share = useCallback(async () => {
    try {
      if (navigator.share) await navigator.share({ title: t.offerTitle, text });
      else {
        await writeClipboard(text);
        toast.success(t.sharedFallback);
      }
    } catch (e) {
      if ((e as { name?: string } | null)?.name !== "AbortError") toast.error(t.shareFailed);
    }
  }, [text]);

  const transfer = useCallback(() => {
    const list = products();
    if (list.length === 0) return void toast.error(t.noTariff);
    saveTransfer(list);
    toast.success(t.transferred(list.length));
    router.push("/dashboard");
  }, [products, router]);

  return { copy, share, transfer };
}
