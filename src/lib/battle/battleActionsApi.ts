import { hasDemoSession } from "../auth/demoSession";
import type { Vertical } from "./battleCategories";
import * as demo from "./battleDemoActions";
import type { ActionResult, AutoAssignMode, PointConfig } from "./battleTypes";
import { json, legacyRequest, messageOf } from "./legacyRequest";

/** Alle Battle-Aktionen. Im Demo-Modus wirken sie auf das Beispielteam, sonst auf die v1-API. */
async function call<T = undefined>(path: string, init: RequestInit, pick?: (b: Record<string, unknown>) => T): Promise<ActionResult<T>> {
  const body = await legacyRequest(path, init);
  return { success: body.success, message: messageOf(body), data: pick && body.success ? pick(body) : undefined };
}

const demoMode = () => hasDemoSession();

export const battleActions = {
  challenge: (opponentId: string) =>
    demoMode() ? demo.demoCreateChallenge(opponentId) : call("/challenges", json("POST", { opponentId })),
  respond: (id: string, action: "accept" | "decline") =>
    demoMode() ? demo.demoRespond(id, action) : call(`/challenges/${id}/respond`, json("PATCH", { action })),
  cancel: (id: string) => (demoMode() ? demo.demoCancel(id) : call(`/challenges/${id}/cancel`, json("DELETE"))),
  manualAssign: (challengerId: string, opponentId: string) =>
    demoMode()
      ? demo.demoManualAssign(challengerId, opponentId)
      : call("/challenges/manual-assign", json("POST", { challengerId, opponentId })),
  autoAssign: () => (demoMode() ? demo.demoAutoAssign() : call("/challenges/trigger-auto-assign", json("POST"))),
  reportSick: (id: string) => (demoMode() ? demo.demoReportSick(id) : call(`/challenges/${id}/sick`, json("POST"))),
  removeSick: (userId: string) =>
    demoMode() ? demo.demoRemoveSick(userId) : call(`/challenges/sick/${userId}`, json("DELETE")),
  removeInactive: (userId: string) =>
    demoMode() ? demo.demoRemoveInactive(userId) : call(`/challenges/inactive/${userId}`, json("DELETE")),
  resetStreaks: () => (demoMode() ? demo.demoResetStreaks() : call("/challenges/reset-streaks", json("POST"))),
  toggleExclude: (productId: string, excluded: boolean) =>
    demoMode()
      ? demo.demoToggleExclude(productId, excluded)
      : call(`/products/${productId}/battle-exclude`, json("PATCH", { excluded })),
  savePoints: (points: PointConfig, vertical: Vertical): Promise<ActionResult<PointConfig>> =>
    demoMode()
      ? demo.demoSavePoints(points)
      : call("/challenges/point-config", json("PUT", { points, vertical }), (b) => b.points as PointConfig),
  toggleCron: (enabled: boolean): Promise<ActionResult<boolean>> =>
    demoMode()
      ? demo.demoToggleCron(enabled)
      : call("/challenges/auto-assign-toggle", json("POST", { enabled }), (b) => !!b.enabled),
  setMode: (mode: AutoAssignMode) =>
    demoMode() ? demo.demoSetMode(mode) : call("/challenges/auto-assign-toggle", json("POST", { mode })),
};
