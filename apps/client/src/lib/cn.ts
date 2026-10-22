import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Klassen zusammenführen, spätere Tailwind-Klassen gewinnen (wie v1 shared/utils/cn). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
