import { Package, ShoppingCart, Smartphone, Target, TrendingUp, Tv, Wifi, type LucideIcon } from "lucide-react";
import type { ChallengeDifficulty, GoalTone } from "./meTypes";
import type { PaceTone } from "./monthGoal";

/** Merker "Beträge verbergen" (v1 vf-hide-amounts). */
export const HIDE_AMOUNTS_KEY = "vf-hide-amounts";

/** Unschärfe für Beträge, wenn sie verborgen sind (v1 amountBlur). */
export const hiddenAmount = (hidden: boolean) => (hidden ? "blur-md select-none" : "blur-0");

/** Grundkarte des Reiters "Ich" wie v1 cardCls. */
export const ME_CARD = "glass-surface rounded-[24px]";

export interface GoalToneStyle {
  gradient: string;
  strong: string;
  soft: string;
  track: string;
}

/** Farben je Ziel-Ansicht (v1 SwipeableGoalCard). Klassen stehen ausgeschrieben, damit Tailwind sie findet. */
export const GOAL_TONES: Record<GoalTone, GoalToneStyle> = {
  purple: {
    gradient: "from-purple-500 to-purple-600",
    strong: "text-purple-700 dark:text-purple-300",
    soft: "text-purple-500 dark:text-purple-400",
    track: "bg-purple-200 dark:bg-purple-900/40",
  },
  indigo: {
    gradient: "from-indigo-500 to-indigo-600",
    strong: "text-indigo-700 dark:text-indigo-300",
    soft: "text-indigo-500 dark:text-indigo-400",
    track: "bg-indigo-200 dark:bg-indigo-900/40",
  },
  red: {
    gradient: "from-red-500 to-red-600",
    strong: "text-red-700 dark:text-red-300",
    soft: "text-red-500 dark:text-red-400",
    track: "bg-red-200 dark:bg-red-900/40",
  },
  blue: {
    gradient: "from-blue-500 to-blue-600",
    strong: "text-blue-700 dark:text-blue-300",
    soft: "text-blue-500 dark:text-blue-400",
    track: "bg-blue-200 dark:bg-blue-900/40",
  },
  green: {
    gradient: "from-green-500 to-green-600",
    strong: "text-green-700 dark:text-green-300",
    soft: "text-green-500 dark:text-green-400",
    track: "bg-green-200 dark:bg-green-900/40",
  },
  orange: {
    gradient: "from-orange-500 to-orange-600",
    strong: "text-orange-700 dark:text-orange-300",
    soft: "text-orange-500 dark:text-orange-400",
    track: "bg-orange-200 dark:bg-orange-900/40",
  },
  pink: {
    gradient: "from-pink-500 to-pink-600",
    strong: "text-pink-700 dark:text-pink-300",
    soft: "text-pink-500 dark:text-pink-400",
    track: "bg-pink-200 dark:bg-pink-900/40",
  },
  gray: {
    gradient: "from-gray-500 to-gray-600",
    strong: "text-gray-700 dark:text-gray-300",
    soft: "text-gray-500 dark:text-gray-400",
    track: "bg-gray-200 dark:bg-gray-800",
  },
};

/** Symbol je Produktkategorie; "visits" steht für Besuche, unbekannte Kategorien zeigen einen Einkaufswagen. */
export const GOAL_ICONS: Record<string, LucideIcon> = {
  visits: Target,
  KIP: Wifi,
  Glasfaser: Wifi,
  Mobile: Smartphone,
  "Giga TV": Tv,
  Upsell: TrendingUp,
  KAS: Package,
  other: ShoppingCart,
};

/** Punktfarbe der Produkte im Monatsziel. */
export const PRODUCT_DOTS: Record<string, string> = {
  KIP: "bg-red-500",
  Glasfaser: "bg-blue-500",
  Mobile: "bg-green-500",
  "Giga TV": "bg-purple-500",
  KAS: "bg-orange-500",
  Upsell: "bg-pink-500",
};

export const PACE_TEXT: Record<PaceTone, string> = {
  green: "text-green-600 dark:text-green-400",
  blue: "text-blue-600 dark:text-blue-400",
  amber: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
};

export const DIFFICULTY_FILL: Record<ChallengeDifficulty, string> = {
  easy: "from-green-500 to-emerald-600",
  medium: "from-blue-500 to-cyan-600",
  hard: "from-orange-500 to-red-600",
  extreme: "from-purple-500 to-pink-600",
};

export const CHALLENGE_EMOJI = { doors: "🚪", sales: "💰", performance: "📊", mixed: "🎯" } as const;
