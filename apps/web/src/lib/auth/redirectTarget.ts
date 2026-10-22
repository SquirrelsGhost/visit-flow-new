/** Ziel nach dem Login: die Seite aus ?from=, die vorher geschützt war, sonst das Dashboard (wie v1). */
export function redirectTarget(from: string | null): string {
  if (!from || !from.startsWith("/") || from.startsWith("//") || from.startsWith("/\\")) return "/dashboard";
  return from;
}
