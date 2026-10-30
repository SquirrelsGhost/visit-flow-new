import { DEMO_ADMIN } from "../auth/demoSession";
import type { Vertical } from "../battle/battleCategories";
import type { Contest, ContestGoal } from "./contestTypes";

const GOALS: Record<Vertical, ContestGoal[]> = {
  telco: [{ category: "KIP", target: 12 }, { category: "Mobile", target: 8 }],
  energy: [{ category: "Strom", target: 15 }, { category: "Gas", target: 8 }],
  // v1: in Lead zählt im Gewinnspiel nur ein Produkt, der Lead (als Solar_PV gespeichert)
  solar: [{ category: "Solar_PV", target: 10 }],
};

const day = (offset: number, hour = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

/** Zwei Beispiel-Gewinnspiele: ein laufendes Rennen im Team und eine geplante Mentor-Verlosung. */
export function demoContests(vertical: Vertical): Contest[] {
  return [
    {
      id: "demo-contest-race",
      teamId: "demo-team",
      name: "Herbst-Sprint",
      description: "Wer bis Monatsende die meisten Ziele schafft, gewinnt. Zählt ab dem ersten Tag des Sprints.",
      type: "individual",
      contestType: "race",
      selectedUserIds: [DEMO_ADMIN.id, "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"],
      goals: GOALS[vertical],
      prizes: [
        { rank: 1, prize: "150 € Tankgutschein" },
        { rank: 2, prize: "100 € Amazon" },
        { rank: 3, prize: "50 € Essen gehen" },
      ],
      startDate: day(-12),
      endDate: day(9),
      status: "active",
      scope: "team",
      createdBy: DEMO_ADMIN.id,
      createdAt: day(-14),
    },
    {
      id: "demo-contest-mentor",
      teamId: "demo-team",
      name: "Mentee-Challenge",
      description: "Qualifiziere dich mit deinem Ziel für die Verlosung am Freitag.",
      type: "individual",
      contestType: "qualification",
      goals: GOALS[vertical].slice(0, 1).map((g) => ({ ...g, target: Math.ceil(g.target / 3) })),
      prizes: [{ rank: 1, prize: "Abendessen mit dem Team" }],
      selectedUserIds: ["b1", "b3", "b5", DEMO_ADMIN.id],
      startDate: day(2, 8),
      endDate: day(6),
      status: "planned",
      scope: "mentor",
      createdBy: "b6",
      createdAt: day(-1),
    },
  ];
}
