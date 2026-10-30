import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { Portal } from "../../../lib/assistant/portals";
import { cn } from "../../../lib/cn";
import { riseIn } from "../../../lib/motion/presets";

/** Große Verlaufskarte für das wichtigste Portal (v1 FeaturedPortalCard), mit sanftem Lichtschimmer statt Dauer-Pulsieren. */
export interface FeaturedPortalProps { portal: Portal; onOpen: (p: Portal) => void }

export default function FeaturedPortal({ portal, onOpen }: FeaturedPortalProps) {
  const Icon = portal.icon;
  return (
    <motion.button
      type="button"
      variants={riseIn}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(portal)}
      aria-describedby={`portal-desc-${portal.id}`}
      className="group relative w-full overflow-hidden rounded-2xl text-left shadow-xl shadow-slate-900/10 transition-shadow duration-500 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:outline-none dark:shadow-black/40"
    >
      <span aria-hidden className={cn("absolute inset-0 bg-gradient-to-r", portal.gradient)} />
      <span
        aria-hidden
        className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:18px_18px]"
      />
      <span
        aria-hidden
        className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:left-[110%] group-hover:opacity-100 motion-reduce:hidden"
      />
      <span className="relative z-10 flex items-center justify-between gap-4 p-5 md:p-6">
        <span className="flex min-w-0 items-center gap-4">
          <span className="rounded-2xl bg-white/20 p-3 shadow-lg ring-1 ring-white/30 backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
            <Icon className="h-8 w-8 text-white" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xl font-bold whitespace-nowrap text-white">{portal.title}</span>
              {portal.badge && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">{portal.badge}</span>
              )}
            </span>
            <span id={`portal-desc-${portal.id}`} className="block text-sm text-white/85">
              {portal.description}
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-white/10 p-3 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/20">
          <ArrowRight className="h-6 w-6 text-white" aria-hidden />
        </span>
      </span>
    </motion.button>
  );
}
