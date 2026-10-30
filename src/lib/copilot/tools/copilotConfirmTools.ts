import { battleActions } from "../../battle/battleActionsApi";
import { loadTeamUsers } from "../../battle/battleApi";
import { normalize } from "../copilotMatch";
import { hasAnyRole } from "../../navigation/userMenuItems";
import { clampDraft, statusPatch } from "../../team/statusPayload";
import { saveMemberPatch } from "../../team/teamApi";
import { copilotToolTexts } from "../../../texts/copilotToolTexts";
import { addressOf, findAppointmentHouse, saveAppointment } from "./appointmentTool";
import { str, type ConfirmToolName, type CopilotProposal, type ToolArgs, type ToolContext } from "./copilotToolTypes";

const t = copilotToolTexts;
const DAY_STATUSES = ["active", "sick", "inactive"] as const;
type DayStatus = (typeof DAY_STATUSES)[number];
const dayStatusOf = (args: ToolArgs): DayStatus | null => DAY_STATUSES.find((s) => s === str(args, "status")) ?? null;
const localDay = (now: number) => new Date(now - new Date(now).getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const isDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Zeitraum wie im Tagesstatus-Dialog: Berater melden Urlaub erst ab morgen (v1-Regel). */
function dayRange(status: DayStatus, args: ToolArgs, ctx: ToolContext) {
  const today = localDay(ctx.now);
  const until = str(args, "until");
  const lead = ctx.user !== null && hasAnyRole(ctx.user, ["admin", "gebietsmanager", "teamleiter", "strukturleiter", "mentor"]);
  return clampDraft({ status, reason: "", start: today, end: isDay(until) ? until : today }, lead, today);
}

/** Was vorbereitet wurde, damit Enes und der Nutzer dasselbe sehen. Ein Fehlertext, wenn es nicht geht. */
export type Prepared = { proposal: Omit<CopilotProposal, "id" | "state"> } | { error: string };

async function findColleague(name: string, ctx: ToolContext) {
  const wanted = normalize(name);
  const users = (await loadTeamUsers()).filter((u) => u.id !== ctx.user?.id && u.isActive !== false);
  return users.find((u) => normalize(u.name) === wanted) ?? users.find((u) => normalize(u.name).split(" ")[0] === wanted.split(" ")[0]) ?? null;
}

/** Bereitet einen Speichern-Vorschlag vor: prüft, ob er machbar ist, und beschreibt ihn für die Karte. */
export async function prepareProposal(name: ConfirmToolName, args: ToolArgs, ctx: ToolContext): Promise<Prepared> {
  switch (name) {
    case "schedule_appointment": {
      const date = str(args, "date");
      const time = str(args, "time");
      if (!isDay(date) || !/^\d{2}:\d{2}$/.test(time)) return { error: t.badDate };
      const house = findAppointmentHouse(ctx);
      if (!house) return { error: t.noDoor };
      return { proposal: { name, args: { ...args, houseId: house.id }, title: t.appointmentTitle(date, time), detail: addressOf(house) } };
    }
    case "set_day_status": {
      const status = dayStatusOf(args);
      if (!status || !ctx.user) return { error: t.notPossible };
      const range = dayRange(status, args, ctx);
      return { proposal: { name, args, title: t.dayStatusTitle(status), detail: status === "active" ? t.today : t.range(range.start, range.end) } };
    }
    case "challenge_colleague": {
      const colleague = await findColleague(str(args, "name"), ctx);
      if (!colleague) return { error: t.noColleague(str(args, "name")) };
      return { proposal: { name, args: { ...args, opponentId: colleague.id }, title: t.challengeTitle, detail: colleague.name } };
    }
  }
}

/** Führt einen bestätigten Vorschlag aus. Liefert den Text für die Karte. */
export async function runProposal(proposal: CopilotProposal, ctx: ToolContext): Promise<{ ok: boolean; note: string }> {
  const { args } = proposal;
  try {
    switch (proposal.name) {
      case "schedule_appointment":
        return (await saveAppointment(str(args, "houseId"), args)) ? { ok: true, note: t.saved } : { ok: false, note: t.noDoor };
      case "set_day_status": {
        const status = dayStatusOf(args);
        if (!status || !ctx.user) return { ok: false, note: t.notPossible };
        const result = await saveMemberPatch(ctx.user.id, statusPatch(dayRange(status, args, ctx), false, new Date(ctx.now)), true);
        return result.ok ? { ok: true, note: t.saved } : { ok: false, note: result.message ?? t.failed };
      }
      case "challenge_colleague": {
        const result = await battleActions.challenge(str(args, "opponentId"));
        return result.success ? { ok: true, note: t.challengeSent } : { ok: false, note: result.message ?? t.failed };
      }
    }
  } catch {
    return { ok: false, note: t.failed };
  }
}
