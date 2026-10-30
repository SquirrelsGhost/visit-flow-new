import { RefreshCw, WifiOff } from "lucide-react";
import { licenseTexts } from "../../texts/licenseTexts";
import GlassBody from "../glass/GlassBody";
import GlassCard from "../glass/GlassCard";
import SheetButton from "./sheets/SheetButton";

interface LicenseErrorProps {
  onRetry: () => void;
}

/** Laden fehlgeschlagen (Funkloch, Server): ruhige Karte mit "Erneut laden". */
export default function LicenseError({ onRetry }: LicenseErrorProps) {
  return (
    <GlassBody>
      <GlassCard className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <WifiOff aria-hidden className="h-7 w-7 text-slate-400" />
        <p className="text-[15px] font-semibold text-foreground">{licenseTexts.loadFailed}</p>
        <div className="w-full max-w-[220px]">
          <SheetButton variant="secondary" icon={RefreshCw} label={licenseTexts.retry} onClick={onRetry} />
        </div>
      </GlassCard>
    </GlassBody>
  );
}
