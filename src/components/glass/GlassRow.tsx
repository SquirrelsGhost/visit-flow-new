import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { GlassTone } from "../../lib/glass/glassTones";
import GlassIcon from "./GlassIcon";
import GlassRowText from "./GlassRowText";
import { GLASS_CHEVRON, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_VALUE } from "./glassStyles";

interface GlassRowProps {
  icon: LucideIcon;
  tone: GlassTone;
  title: string;
  subtitle?: string;
  /** Kurzer Wert rechts. */
  value?: string;
  /** Eigener Inhalt rechts (z. B. Status-Plakette). */
  trailing?: ReactNode;
  href?: string;
  /** Aktion beim Tippen; mit href läuft sie vor dem Seitenwechsel. */
  onClick?: () => void;
  warn?: boolean;
  /** Pfeil rechts; Standard bei Ziel oder Aktion. */
  chevron?: boolean;
}

/** Eine Glas-Zeile: Symbol, Text, Wert. Mit Ziel oder Aktion wird sie bedienbar und bekommt einen Pfeil. */
export default function GlassRow({ icon, tone, title, subtitle, value, trailing, href, onClick, warn, chevron }: GlassRowProps) {
  const interactive = Boolean(href || onClick);
  const content = (
    <>
      <GlassIcon icon={icon} tone={tone} />
      <GlassRowText title={title} subtitle={subtitle} warn={warn} />
      {value && <span className={GLASS_VALUE}>{value}</span>}
      {trailing}
      {(chevron ?? interactive) && <ChevronRight aria-hidden className={GLASS_CHEVRON} />}
    </>
  );
  const className = cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "group");
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  return <div className={GLASS_ROW}>{content}</div>;
}
