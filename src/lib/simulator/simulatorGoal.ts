import { writePreference } from "../preferences";
import type { ProvisionGoal, SimProduct } from "./simulatorTypes";

const GOAL_KEY = "provisionGoal";

interface GoalInput {
  provision: number;
  bonus: number;
  products: readonly { name: string; category: string; quantity: number }[];
  contractMonth: number;
  totalProducts?: number;
}

/** Monatsziel im v1-Format bauen (Als Ziel setzen). */
export function buildGoal(input: GoalInput, now = new Date()): ProvisionGoal {
  return {
    targetProvision: input.provision,
    targetBonus: input.bonus,
    targetTotal: input.provision + input.bonus,
    ...(input.totalProducts === undefined ? {} : { targetTotalProducts: input.totalProducts }),
    products: input.products.map(({ name, category, quantity }) => ({ name, category, quantity })),
    contractMonth: input.contractMonth,
    savedAt: now.toISOString(),
    savedMonth: now.getMonth(),
    savedYear: now.getFullYear(),
  };
}

/** Speichert das Ziel lokal wie v1 (localStorage "provisionGoal"), bis es eine v2-API dafür gibt. */
export function saveGoal(goal: ProvisionGoal): void {
  writePreference(GOAL_KEY, JSON.stringify(goal));
}

export const goalProducts = (products: readonly SimProduct[]) => products.map((p) => ({ name: p.name, category: p.category, quantity: p.quantity }));
