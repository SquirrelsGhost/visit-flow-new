import type { LucideIcon } from "lucide-react";
import type { GlassTone } from "../../../lib/glass/glassTones";
import GlassIcon from "../../glass/GlassIcon";
import GlassRowText from "../../glass/GlassRowText";
import GlassSwitch from "../../glass/GlassSwitch";

interface FormToggleRowProps {
  icon: LucideIcon;
  tone: GlassTone;
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle: () => void;
}

/** Ganze Zeile als Schalter: Symbol, Text und Glas-Schalter; Tippen irgendwo auf der Zeile schaltet. */
export default function FormToggleRow({ icon, tone, title, subtitle, checked, onToggle }: FormToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full items-center gap-3.5 rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
    >
      <GlassIcon icon={icon} tone={tone} />
      <GlassRowText title={title} subtitle={subtitle} />
      <GlassSwitch checked={checked} />
    </button>
  );
}
