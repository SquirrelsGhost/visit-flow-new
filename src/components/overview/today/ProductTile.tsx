import type { ProductCategory } from "../../../lib/map/productMeta";
import { PRODUCT_GROUP_META } from "../../../lib/overview/productGroups";
import GlassIcon from "../../glass/GlassIcon";
import GlassNumber from "../../glass/GlassNumber";

interface ProductTileProps {
  category: ProductCategory;
  count: number;
}

/** Kachel einer Produktgruppe: farbiges Symbol, Anzahl groß, Name klein. */
export default function ProductTile({ category, count }: ProductTileProps) {
  const meta = PRODUCT_GROUP_META[category];
  if (!meta) return null;
  return (
    <div className="flex flex-col items-start gap-3 rounded-[20px] bg-white/50 p-3.5 ring-1 ring-inset ring-[var(--glass-divider)] dark:bg-white/[0.03]">
      <GlassIcon icon={meta.icon} tone={meta.tone} />
      <div className="min-w-0">
        <GlassNumber value={count} duration={0.9} className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-foreground" />
        <p className="mt-1 truncate text-[12px] font-medium text-muted-foreground">{meta.label}</p>
      </div>
    </div>
  );
}
