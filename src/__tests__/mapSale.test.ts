import { describe, expect, it } from "vitest";
import { houseFromDraft } from "../hooks/useMapHouses";
import type { DraftHouse } from "../lib/map/mapTypes";
import { productMeta } from "../lib/map/productMeta";
import { saleTabs, tariffsForCategory } from "../lib/map/saleCatalog";
import { addTariffToCart, parseOldPrice, productType, questionsFor, saleSummary } from "../lib/map/saleProducts";
import { buildSyncPayload } from "../lib/map/visitSync";
import type { Tariff } from "../lib/tariff/tariffTypes";

const tariff = (over: Partial<Tariff>): Tariff => ({
  id: over.name ?? "t",
  name: "Tarif",
  category: "kabel-neu",
  periods: [{ label: "", months: "1-24", price: 40 }],
  isActive: true,
  ...over,
});

const DRAFT: DraftHouse = {
  lng: 6.95,
  lat: 50.94,
  street: "Domkloster",
  houseNumber: "4",
  zipCode: "50667",
  city: "Köln",
  type: "EFH",
  doorName: "",
};

describe("Verkauf wie v1 SaleDialog", () => {
  it("fragt in der v1-Reihenfolge nach", () => {
    expect(questionsFor(tariff({ startCredit: 100 }))).toEqual(["credit", "firstInstall"]);
    expect(questionsFor(tariff({ category: "kabel-bestand" }))).toEqual(["oldPrice", "oldRouter", "tvConnect"]);
    expect(questionsFor(tariff({ category: "mobil", name: "GigaCube 5G" }))).toEqual(["gigaCube"]);
    expect(questionsFor(tariff({ category: "router" }))).toEqual([]);
  });

  it("hängt die Antworten wie v1 an den Produktnamen", () => {
    const t = tariff({ name: "GigaZuhause Kabel", bandwidth: 1000, startCredit: 100 });
    expect(productType(t, { creditGiven: true, firstInstall: true })).toBe(
      "GigaZuhause Kabel (1000 Mbit/s) - 100€ SG gegeben - First Install",
    );
    const giga = tariff({ name: "Giga TV Upsell", category: "kabel-bestand", periods: [{ label: "", months: "1-24", price: 50 }] });
    expect(productType(giga, { oldPrice: "38.00", oldRouter: true })).toBe("Giga TV Upsell (Upsell Giga Grade 3) - AP: 38.00€ - Alter Router");
  });

  it("legt TV Connect zuhause bei Internet-Neukunden einmal dazu, beim Upsell nur auf Ja", () => {
    let cart = addTariffToCart([], "KIP", tariff({ name: "Kabel 250" }));
    cart = addTariffToCart(cart, "KIP", tariff({ name: "Kabel 1000" }));
    expect(cart.filter((p) => p.type === "TV Connect zuhause")).toHaveLength(1);
    expect(addTariffToCart([], "Upsell", tariff({ category: "kabel-bestand" }), { tvConnect: false })).toHaveLength(1);
    expect(addTariffToCart([], "Upsell", tariff({ category: "kabel-bestand" }), { tvConnect: true })).toHaveLength(2);
    expect(saleSummary(cart)).toBe("1x Kabel 250, 1x TV Connect zuhause, 1x Kabel 1000");
  });

  it("prüft den Altpreis wie v1", () => {
    expect(parseOldPrice("34,9")).toBe("34.90");
    expect(parseOldPrice("1000")).toBeNull();
    expect(parseOldPrice("abc")).toBeNull();
  });

  it("trennt GigaTV und KAS und sortiert Router wie v1", () => {
    const tv = [tariff({ name: "TV Connect Standard", category: "tv" }), tariff({ name: "GigaTV Cable", category: "tv" })];
    expect(tariffsForCategory("GigaTV", tv).map((t) => t.name)).toEqual(["GigaTV Cable"]);
    expect(tariffsForCategory("KAS", tv).map((t) => t.name)).toEqual(["TV Connect Standard"]);
    const routers = [tariff({ name: "FRITZ!Box 6690 Cable", category: "router" }), tariff({ name: "Vodafone Station", category: "router" })];
    expect(tariffsForCategory("Zubehör", routers)[0]!.name).toBe("Vodafone Station");
    expect(saleTabs("KIP").map((t) => t.id)).toEqual(["kabel", "glasfaser", "dsl"]);
  });

  it("ordnet Punkte-Relevanz wie v1 getProductMetadata zu", () => {
    expect(productMeta("KIP", "GigaZuhause Kabel (1000 Mbit/s)")).toEqual({ subCategory: "KIP_Standard", isPointRelevant: true, isPremium: false });
    expect(productMeta("KAS", "TV Connect zuhause").isPointRelevant).toBe(false);
    expect(productMeta("GigaTV", "Giga TV Home Sound inkl. Netflix")).toEqual({ subCategory: "GigaTV_Home_Sound", isPointRelevant: true, isPremium: true });
    expect(productMeta("Solar_PV", "Direkt-Lead").subCategory).toBe("Solar_PV_Standard");
  });

  it("speichert die Produkte an der Tür und schickt sie mit Tür-id an /products/bulk", () => {
    const house = houseFromDraft(DRAFT, "Angetroffen → Sale", "", undefined, {
      products: [{ category: "Mobile", type: "Giga Mobil S", quantity: 2 }],
      vertical: "telco",
    });
    const payload = buildSyncPayload(house);
    expect(payload.products).toHaveLength(1);
    expect(payload.products[0]).toMatchObject({ doorId: house.doors[0]!.id, category: "Mobile", quantity: 2, subCategory: "Mobile_GigaMobil" });
    expect(payload.doors[0]).not.toHaveProperty("products");
  });

  it("nimmt beim Solar-Lead den Namen an die Tür", () => {
    const house = houseFromDraft(DRAFT, "Angetroffen → Sale", "", { phone: "0170" }, {
      products: [{ category: "Solar_PV", type: "Direkt-Lead", quantity: 1 }],
      vertical: "solar",
      doorName: "Max Muster",
    });
    expect(house.doors[0]).toMatchObject({ name: "Max Muster", phone: "0170" });
    expect(house.familyName).toBe("Max Muster");
  });
});
