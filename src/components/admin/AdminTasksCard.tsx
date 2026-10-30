import { Handshake, ReceiptEuro, UserCheck, type LucideIcon } from "lucide-react";
import type { AdminTasks } from "../../lib/admin/adminTypes";
import type { GlassTone } from "../../lib/glass/glassTones";
import { adminTexts } from "../../texts/adminTexts";
import GlassChip from "../glass/GlassChip";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

interface AdminTasksCardProps {
  /** undefined = lädt. */
  tasks: AdminTasks | undefined;
}

const texts = adminTexts.tasks;
const ROWS: readonly { key: keyof AdminTasks; icon: LucideIcon; tone: GlassTone }[] = [
  { key: "whitelist", icon: UserCheck, tone: "amber" },
  { key: "partners", icon: Handshake, tone: "red" },
  { key: "payments", icon: ReceiptEuro, tone: "indigo" },
];

/** Was auf einen Admin wartet (v1 Whitelist, Partnerbewerbungen, ungelöste Stripe-Zahlungen), mit Zähler je Punkt. */
export default function AdminTasksCard({ tasks }: AdminTasksCardProps) {
  return (
    <GlassSection label={texts.label} footer={texts.footer}>
      {ROWS.map((row) => {
        const count = tasks?.[row.key];
        return (
          <GlassRow
            key={row.key}
            icon={row.icon}
            tone={count ? row.tone : "gray"}
            title={texts[row.key]}
            trailing={count === undefined ? <span className="h-6 w-10 animate-pulse rounded-full bg-[var(--glass-track)]" /> : count > 0 ? <GlassChip tone="red">{count}</GlassChip> : <GlassChip tone="green">{texts.none}</GlassChip>}
          />
        );
      })}
    </GlassSection>
  );
}
