import { ExternalLink, Wrench } from "lucide-react";
import { motion } from "motion/react";
import type { Portal } from "../../../lib/assistant/portals";
import { cn } from "../../../lib/cn";
import { riseIn } from "../../../lib/motion/presets";
import { assistantTexts as t } from "../../../texts/assistantTexts";

/** Kachel eines Portals (v1 PortalCard): Verlaufssymbol, Abzeichen, Titel und Beschreibung; in Wartung gesperrt. */
export interface PortalTileProps { portal: Portal; onOpen: (p: Portal) => void }

export default function PortalTile({ portal, onOpen }: PortalTileProps) {
  const Icon = portal.icon;
  const off = portal.maintenance === true;
  return (
    <motion.button
      type="button"
      variants={riseIn}
      whileHover={off ? undefined : { y: -3 }}
      whileTap={off ? undefined : { scale: 0.97 }}
      onClick={() => onOpen(portal)}
      disabled={off}
      aria-describedby={`portal-desc-${portal.id}`}
      className={cn(
        "glass-surface group relative overflow-hidden rounded-[24px] p-4 text-left transition-[box-shadow,border-color] duration-300",
        off ? "cursor-not-allowed opacity-60" : "hover:border-transparent hover:shadow-xl focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none",
      )}
    >
      {!off && <span aria-hidden className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-[0.06]", portal.gradient)} />}
      <span className="relative z-10 flex flex-col gap-3">
        <span className="flex items-center justify-between">
          <span
            className={cn(
              "rounded-xl bg-gradient-to-br p-2.5 text-white shadow-lg transition-transform duration-300",
              portal.iconBg,
              !off && "group-hover:scale-110",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex items-center gap-2">
            {off ? (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-medium text-white">
                <Wrench className="h-2.5 w-2.5" aria-hidden />
                {t.maintenance}
              </span>
            ) : (
              portal.badge && (
                <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-medium text-white">{portal.badge}</span>
              )
            )}
            {!off && portal.action.kind === "external" && (
              <ExternalLink className="h-4 w-4 text-slate-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
            )}
          </span>
        </span>
        <span>
          <span className="mb-0.5 block font-bold text-slate-900 dark:text-white">{portal.title}</span>
          <span id={`portal-desc-${portal.id}`} className="line-clamp-2 block text-xs text-slate-500 dark:text-slate-400">
            {portal.description}
          </span>
        </span>
      </span>
    </motion.button>
  );
}
