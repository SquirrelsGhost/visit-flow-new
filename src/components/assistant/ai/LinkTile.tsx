import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import type { ImportantLink } from "../../../lib/assistant/importantLinks";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";

interface LinkTileProps {
  link: ImportantLink;
  index: number;
}

/** Eine Link-Kachel in der Farbe des Ziels; hebt sich beim Darüberfahren leicht an. */
export default function LinkTile({ link, index }: LinkTileProps) {
  const Icon = link.icon;
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ ...SNAPPY_SPRING, delay: index * 0.04 }}
      className={cn(
        link.color,
        "block rounded-xl border-2 border-current/15 p-3 transition-[border-color,box-shadow] duration-300 hover:border-current/40 hover:shadow-md md:p-4",
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 md:h-6 md:w-6" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1 text-xs leading-tight font-semibold md:text-base">
            <span className="truncate">{link.title}</span>
            <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60 md:h-3 md:w-3" />
          </div>
          <p className="line-clamp-2 text-[10px] leading-tight opacity-80 md:text-sm">{link.description}</p>
        </div>
      </div>
    </motion.a>
  );
}
