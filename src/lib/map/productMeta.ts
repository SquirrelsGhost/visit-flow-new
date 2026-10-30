/** Produkt-Kategorien wie in v1 (types ProductCategory). */
export type ProductCategory =
  | "KIP"
  | "Glasfaser"
  | "GigaTV"
  | "KAS"
  | "Mobile"
  | "Upsell"
  | "Zubehör"
  | "Solar_PV"
  | "Solar_Miete"
  | "Speicher"
  | "Waermepumpe"
  | "Wallbox"
  | "Strom"
  | "Gas";

export interface ProductMeta {
  subCategory: string;
  isPointRelevant: boolean;
  isPremium: boolean;
}

const meta = (subCategory: string, isPointRelevant = false, isPremium = false): ProductMeta => ({
  subCategory,
  isPointRelevant,
  isPremium,
});

/** Feste Produkte aus v1 productOptions, die anders eingeordnet werden als die Ableitung unten. */
const EXACT: Record<string, ProductMeta> = {
  "GigaTV|Multi Room": meta("GigaTV_MultiRoom", true),
  "GigaTV|Multi Room / Home Sound": meta("GigaTV_MultiRoom", true),
  "Zubehör|TV Connect Standard": meta("Zubehoer_TV_Connect"),
  "Zubehör|Basic TV": meta("Zubehoer_Basic_TV"),
  "Zubehör|Fritzbox": meta("Zubehoer_Fritzbox"),
};

const SOLAR: Record<string, ProductMeta> = {
  Solar_PV: meta("Solar_PV_Standard", false, true),
  Solar_Miete: meta("Solar_Miete_Standard", false, true),
  Speicher: meta("Speicher_Standard"),
  Waermepumpe: meta("Waermepumpe_Standard", false, true),
  Wallbox: meta("Wallbox_Standard"),
  Strom: meta("Strom_Standard"),
  Gas: meta("Gas_Standard"),
};

function gigaTv(type: string): ProductMeta {
  const premium = type.includes("premium") || type.includes("netflix");
  if (type.includes("home sound")) return meta("GigaTV_Home_Sound", true, premium);
  if (type.includes("mobile")) return meta("GigaTV_Mobile_App", true);
  if (type.includes("multi room")) return meta("GigaTV_MultiRoom", true);
  return meta("GigaTV_Home_Cable", true, type.includes("home cable") && premium);
}

function kas(type: string): ProductMeta {
  if (type.includes("connect")) {
    if (type.includes("zuhause")) return meta("TV_Connect");
    if (type.includes("start")) return meta("TV_Connect_Start");
    return meta(type.includes("standard") ? "TV_Connect_Standard" : "TV_Connect");
  }
  if (type.includes("basic")) return meta("TV_Basic");
  if (type.includes("multi room")) return meta("TV_MultiRoom");
  return meta("TV_Connect_Standard");
}

function mobile(type: string): ProductMeta {
  if (type.includes("giga")) return meta("Mobile_GigaMobil");
  if (type.includes("family")) return meta("Mobile_FamilyCard");
  if (type.includes("red")) return meta("Mobile_Red");
  return meta("Mobile_GigaMobil");
}

function zubehoer(type: string): ProductMeta {
  if (type.includes("tv connect")) return meta("Zubehoer_TV_Connect");
  if (type.includes("fritzbox")) return meta("Zubehoer_Fritzbox");
  if (type.includes("basic tv")) return meta("Zubehoer_Basic_TV");
  return meta("Zubehoer_Other");
}

/**
 * Unterkategorie, Punkte-Relevanz und Premium eines verkauften Produkts (v1 getProductMetadata).
 * Davon hängen Punkte im Battle und die Provision ab, deshalb genau wie in v1.
 */
export function productMeta(category: ProductCategory, type: string): ProductMeta {
  const exact = EXACT[`${category}|${type}`];
  if (exact) return exact;
  const solar = SOLAR[category];
  if (solar) return solar;
  const lower = type.toLowerCase();
  if (category === "KIP" || lower.includes("kip")) return meta("KIP_Standard", true);
  if (category === "Glasfaser" || lower.includes("glasfaser")) return meta("Glasfaser_Standard", true);
  if (category === "GigaTV" || (lower.includes("giga") && lower.includes("tv"))) return gigaTv(lower);
  if (category === "KAS") return kas(lower);
  if (category === "Mobile") return mobile(lower);
  if (category === "Upsell") return lower.includes("premium") ? meta("Upsell_Premium", false, true) : meta("Upsell_Standard");
  if (category === "Zubehör") return zubehoer(lower);
  return meta("KIP_Standard");
}
