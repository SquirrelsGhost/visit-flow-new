import { ease, PHASE, within, WALK_BEATS } from "./journeyTimeline";
import { ROUTE, TEAM_EVENTS, TEAM_START, type DoorStatus } from "./revierData";
import { HOUSE_SHAPES, walkAt, type Vec2 } from "./revierWorld";

/** Alles, was die Szene bei Fortschritt t zeigen soll. Reine Rechnung, kein three.js. */
export interface RevierState {
  rise: number;
  compass: number;
  spread: number;
  spin: number;
  walker: Vec2;
  visited: number;
  showWalker: number;
  saleLabel: boolean;
  teamLabel: boolean;
  coach: number;
  team: number;
  drive: number;
  shield: number;
  doors: (DoorStatus | null)[];
}

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);

export function stateAt(t: number): RevierState {
  const dive = ease(within(t, PHASE.dive));
  const finale = ease(within(t, PHASE.finale));
  const wk = within(t, PHASE.walk);
  const teamK = within(t, PHASE.team);
  const { pos, visited } = walkAt(wk);

  const doors: (DoorStatus | null)[] = new Array(HOUSE_SHAPES.length).fill(null);
  if (dive > 0.75) TEAM_START.forEach(([house, status]) => (doors[house] = status));
  const teamDone = Math.floor(teamK * TEAM_EVENTS.length);
  TEAM_EVENTS.slice(0, teamDone).forEach(([house, status]) => (doors[house] = status));
  const walked = t >= PHASE.walk[0] ? visited : 0;
  ROUTE.slice(0, walked).forEach(([house, status]) => (doors[house] = status));

  const coachIn = clamp((wk - WALK_BEATS.coach[0] + 0.05) / 0.1);

  return {
    rise: dive * (1 - finale * 0.9),
    compass: clamp(1 - dive * 1.3) + finale,
    spread: dive * (1 - finale),
    spin: dive * Math.PI * 0.75 + finale * Math.PI * 1.25,
    walker: pos,
    visited: walked,
    teamLabel: teamK > 0.15 && teamK < 1,
    saleLabel: t >= PHASE.walk[0] && wk >= WALK_BEATS.sale[0] && wk < WALK_BEATS.sale[1],
    showWalker: clamp((dive - 0.6) / 0.4) * (1 - finale),
    coach: coachIn * (1 - clamp(teamK * 2)),
    team: clamp(teamK * 3) * (1 - finale),
    drive: within(t, PHASE.drive),
    shield: within(t, PHASE.shield) * (1 - finale),
    doors: dive > 0.75 || t > PHASE.dive[1] ? doors : doors.map(() => null),
  };
}
