import type { AdminFigures } from "../../lib/admin/adminTypes";
import { adminTexts } from "../../texts/adminTexts";
import { fill } from "../../texts/profileTexts";
import GlassNumber from "../glass/GlassNumber";
import GlassRing from "../glass/GlassRing";
import AdminPanel from "./AdminPanel";
import AdminTile from "./AdminTile";

interface AdminActivityCardProps {
  figures: AdminFigures;
  /** Aktive Personen ohne Sperre (Bezugsgröße für den Ring). */
  people: number;
}

const texts = adminTexts.activity;

/** Wie viele heute draußen sind: Anteil der Aktiven als Ring, daneben Türen, Türen je Kopf und Quote. */
export default function AdminActivityCard({ figures, people }: AdminActivityCardProps) {
  const share = people > 0 ? figures.activeToday / people : 0;
  const perHead = figures.activeToday > 0 ? Math.round(figures.doorsToday / figures.activeToday) : 0;
  return (
    <AdminPanel label={texts.label} footer={texts.footer}>
      <div className="flex flex-col items-center gap-4 min-[440px]:flex-row min-[440px]:gap-5">
        <GlassRing share={share} tone={share >= 0.6 ? "green" : share >= 0.3 ? "amber" : "red"} size={116} label={fill(texts.share, { active: figures.activeToday, people })}>
          <GlassNumber value={Math.round(share * 100)} kind="percent" className="text-[26px] font-semibold tracking-[-0.03em] text-foreground" />
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            {figures.activeToday} / {people}
          </span>
        </GlassRing>
        <div className="grid w-full min-w-0 flex-1 grid-cols-2 gap-2.5">
          <AdminTile label={texts.doors} value={figures.doorsToday} />
          <AdminTile label={texts.perHead} value={perHead} />
          <AdminTile label={texts.conversion} value={figures.conversion} kind="percent" />
          <AdminTile label={texts.idle} value={Math.max(0, people - figures.activeToday)} warn />
        </div>
      </div>
    </AdminPanel>
  );
}
