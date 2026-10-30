import { berlinDay } from "./arenaScore";
import { DEMO_ME, demoChallenge } from "./battleDemoData";
import { demoDelay, demoState, isLive } from "./battleDemoStore";
import type { ActionResult, AutoAssignMode, PointConfig } from "./battleTypes";

/** Aktionen der Demo-Arena. Sie verändern den Speicherzustand so, wie der Server es täte. */
const ok = <T,>(data?: T, message?: string): ActionResult<T> => ({ success: true, data, message });
const fail = (message: string): ActionResult => ({ success: false, message });

const busy = (userId: string) =>
  demoState().challenges.some(
    (c) => (isLive(c) || c.status === "pending") && (c.challengerId === userId || c.opponentId === userId),
  );

let nextId = 100;
const newId = () => `demo-${nextId++}`;

/** Fordert jemanden heraus. In der Demo nimmt die Person nach ein paar Sekunden von selbst an. */
export async function demoCreateChallenge(opponentId: string): Promise<ActionResult> {
  await demoDelay();
  if (busy(opponentId)) return fail("Diese Person hat heute schon ein Battle.");
  const c = demoChallenge(newId(), DEMO_ME, opponentId, berlinDay(new Date()), { status: "pending" });
  demoState().challenges.push(c);
  setTimeout(() => {
    c.status = "active";
    window.dispatchEvent(new CustomEvent("battle-challenge-accepted"));
  }, 4000);
  return ok();
}

export async function demoRespond(id: string, action: "accept" | "decline"): Promise<ActionResult> {
  await demoDelay();
  const c = demoState().challenges.find((x) => x.id === id);
  if (c) c.status = action === "accept" ? "active" : "declined";
  return ok();
}

export async function demoCancel(id: string): Promise<ActionResult> {
  await demoDelay();
  const s = demoState();
  s.challenges = s.challenges.filter((c) => c.id !== id);
  return ok();
}

export async function demoManualAssign(a: string, b: string): Promise<ActionResult> {
  await demoDelay();
  demoState().challenges.push(demoChallenge(newId(), a, b, berlinDay(new Date())));
  return ok();
}

/** Paart alle bereiten Berater ohne Battle, wie der Cronjob um 12 Uhr. */
export async function demoAutoAssign(): Promise<ActionResult> {
  await demoDelay(700);
  const s = demoState();
  const free = [...s.readiness.newcomers, ...s.readiness.experienced].filter((r) => !busy(r.userId));
  let count = 0;
  for (let i = 0; i + 1 < free.length; i += 2, count++) {
    s.challenges.push(demoChallenge(newId(), free[i].userId, free[i + 1].userId, berlinDay(new Date()), { isAutoAssigned: true }));
  }
  return count ? ok(undefined, `${count} Battle${count === 1 ? "" : "s"} automatisch zugewiesen`) : fail("Alle bereiten Berater haben schon ein Battle.");
}

export async function demoReportSick(id: string): Promise<ActionResult> {
  await demoDelay();
  const s = demoState();
  const c = s.challenges.find((x) => x.id === id);
  if (!c) return fail("Battle nicht gefunden");
  c.status = "cancelled_sick";
  s.sickBy[c.id] = DEMO_ME;
  s.readiness.sickToday.push({ userId: DEMO_ME, name: "Demo Admin", month: null });
  return ok();
}

export async function demoRemoveSick(userId: string): Promise<ActionResult> {
  await demoDelay();
  const r = demoState().readiness;
  const entry = r.sickToday.find((x) => x.userId === userId);
  r.sickToday = r.sickToday.filter((x) => x.userId !== userId);
  if (entry && entry.month !== null) (entry.month <= 4 ? r.newcomers : r.experienced).push(entry);
  return ok();
}

export async function demoRemoveInactive(userId: string): Promise<ActionResult> {
  await demoDelay();
  const s = demoState();
  const entry = s.readiness.inactive.find((x) => x.userId === userId);
  s.readiness.inactive = s.readiness.inactive.filter((x) => x.userId !== userId);
  const user = s.users.find((u) => u.id === userId);
  if (user) user.battleInactive = false;
  if (entry && entry.month !== null) {
    const ready = { userId, name: entry.name, month: entry.month };
    (entry.month <= 4 ? s.readiness.newcomers : s.readiness.experienced).push(ready);
  }
  return ok();
}

export async function demoResetStreaks(): Promise<ActionResult> {
  await demoDelay(600);
  demoState().streaks = {};
  return ok();
}

export async function demoToggleExclude(productId: string, excluded: boolean): Promise<ActionResult> {
  await demoDelay(250);
  const p = demoState().products.find((x) => x.id === productId);
  if (p) p.battleExcluded = excluded;
  return ok();
}

export async function demoSavePoints(points: PointConfig): Promise<ActionResult<PointConfig>> {
  await demoDelay();
  demoState().points = { ...points };
  return ok({ ...points });
}

export async function demoToggleCron(enabled: boolean): Promise<ActionResult<boolean>> {
  await demoDelay(300);
  demoState().cronEnabled = enabled;
  return ok(enabled);
}

export async function demoSetMode(mode: AutoAssignMode): Promise<ActionResult> {
  await demoDelay(300);
  demoState().mode = mode;
  return ok();
}
