import { BookOpen, HelpCircle, Lightbulb, MessageSquare, Wrench, type LucideIcon } from "lucide-react";
import type { CategoryFilter, KnowledgeCategory } from "./knowledgeTypes";

export interface CategoryAccent {
  stripe: string;
  light: string;
  hoverBorder: string;
  badge: string;
  icon: string;
  glow: string;
  active: string;
}

/** Farbe je Kategorie für Streifen, Abzeichen und aktiven Filter (v1 CATEGORY_ACCENTS). */
export const CATEGORY_ACCENTS: Record<KnowledgeCategory, CategoryAccent> = {
  einwand: {
    stripe: "bg-orange-500",
    light: "bg-orange-50 dark:bg-orange-950/30",
    hoverBorder: "hover:border-orange-400 dark:hover:border-orange-600",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    icon: "text-orange-600 dark:text-orange-400",
    glow: "shadow-orange-100 dark:shadow-orange-900/20",
    active: "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200 dark:shadow-orange-900/30",
  },
  faq: {
    stripe: "bg-blue-500",
    light: "bg-blue-50 dark:bg-blue-950/30",
    hoverBorder: "hover:border-blue-400 dark:hover:border-blue-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: "text-blue-600 dark:text-blue-400",
    glow: "shadow-blue-100 dark:shadow-blue-900/20",
    active: "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200 dark:shadow-blue-900/30",
  },
  verkauf: {
    stripe: "bg-emerald-500",
    light: "bg-emerald-50 dark:bg-emerald-950/30",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-100 dark:shadow-emerald-900/20",
    active: "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200 dark:shadow-emerald-900/30",
  },
  technik: {
    stripe: "bg-violet-500",
    light: "bg-violet-50 dark:bg-violet-950/30",
    hoverBorder: "hover:border-violet-400 dark:hover:border-violet-600",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    icon: "text-violet-600 dark:text-violet-400",
    glow: "shadow-violet-100 dark:shadow-violet-900/20",
    active: "bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-200 dark:shadow-violet-900/30",
  },
};

/** "Alle" ist im aktiven Zustand lila wie in v1. */
export const ALL_ACTIVE = "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200 dark:shadow-purple-900/30";

export const CATEGORY_ICONS: Record<CategoryFilter, LucideIcon> = {
  all: BookOpen,
  einwand: MessageSquare,
  faq: HelpCircle,
  verkauf: Lightbulb,
  technik: Wrench,
};
