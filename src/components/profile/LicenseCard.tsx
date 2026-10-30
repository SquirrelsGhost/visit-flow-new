import { Crown } from "lucide-react";
import { formatEuro, LICENSE_PRICE } from "../../lib/onboarding/licenses";
import type { Subscription } from "../../lib/profile/profileTypes";
import { fill, profileTexts } from "../../texts/profileTexts";
import GlassCard from "../glass/GlassCard";
import GlassNumber from "../glass/GlassNumber";
import SeatBar from "./SeatBar";
import StatusPill from "./StatusPill";

interface LicenseCardProps {
  subscription: Subscription | null | undefined;
}

const texts = profileTexts.subscription;

function seatsText(used: number, total: number): string {
  const free = total - used;
  return free > 0 ? fill(texts.seatsFree, { count: free }) : texts.seatsFull;
}

/** Tiefe Karte der Team-Lizenzen für Teamleiter und Admin, wie eine Bankkarte: belegte Plätze, Monatsbetrag, nächste Abbuchung. */
export default function LicenseCard({ subscription }: LicenseCardProps) {
  const licenses = subscription?.licenses;
  const renews = subscription?.renewsAt && new Date(subscription.renewsAt).toLocaleDateString("de-DE", { day: "numeric", month: "long" });
  return (
    <GlassCard variant="deep" sheen spotlight className="p-5">
            <div className="relative flex items-center gap-3">
        <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-inset ring-white/15">
          <Crown className="h-[18px] w-[18px] text-amber-300" strokeWidth={2.2} />
        </span>
        <p className="flex-1 text-[15px] font-semibold">{texts.teamTitle}</p>
        {subscription && <StatusPill status={subscription.status} onDark />}
      </div>
      <div className="relative mt-5">
        {licenses ? (
          <>
            <p className="glass-text-shine text-[40px] font-semibold leading-none tracking-[-0.035em] tabular-nums">{fill(texts.seats, { used: licenses.used, total: licenses.total })}</p>
            <p className="mt-1.5 text-[13px] text-white/60">
              {texts.seatsLabel} · {seatsText(licenses.used, licenses.total)}
            </p>
            <div className="mt-4">
              <SeatBar used={licenses.used} total={licenses.total} label={texts.seatsLabel} />
            </div>
          </>
        ) : (
          <p className="text-[14px] text-white/70">{subscription === undefined ? texts.loading : subscription ? texts.seatsUnknown : texts.none}</p>
        )}
      </div>
      {subscription && (
        <div className="relative mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            {subscription.price > 0 ? (
              <p className="whitespace-nowrap text-[26px] font-semibold tracking-[-0.025em]">
                <GlassNumber value={subscription.price / 100} kind="euro" duration={1.4} restClassName="opacity-80" />
                <span className="ml-1 text-[13px] font-medium text-white/55">{texts.perMonthShort}</span>
              </p>
            ) : (
              <p className="text-[20px] font-semibold">{texts.free}</p>
            )}
            <p className="text-[12px] text-white/55">{fill(texts.perLicense, { price: formatEuro(LICENSE_PRICE) })}</p>
          </div>
          {renews && (
            <p className="text-right text-[12px] leading-snug text-white/55">
              {texts.renews}
              <span className="block whitespace-nowrap text-[13px] font-medium text-white/85">{renews}</span>
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
